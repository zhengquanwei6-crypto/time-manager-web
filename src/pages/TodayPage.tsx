import dayjs from 'dayjs';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { TodayFilterTabs } from '../components/today/TodayFilterTabs';
import { TodayQuickAddForm } from '../components/today/TodayQuickAddForm';
import { TodayTaskSection } from '../components/today/TodayTaskSection';
import { usePomodoroContext } from '../contexts/PomodoroContext';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import type { TaskFilterValue, TaskFormInput, TaskItem } from '../types/task';
import { formatTime, isTaskDateOverdue } from '../utils/date';
import { formatPomodoroStatus } from '../utils/pomodoro';
import { getTodayTasks } from '../utils/task';

type TodayModuleKey = 'focus' | 'composer' | 'pomodoro';

interface PendingDeleteState {
  type: 'single' | 'batch';
  task?: TaskItem;
  taskIds: string[];
}

const TODAY_LAYOUT_STORAGE_KEY = 'time-manager.today.layout';
const defaultModuleOrder: TodayModuleKey[] = ['focus', 'composer', 'pomodoro'];

function isValidModuleOrder(value: unknown): value is TodayModuleKey[] {
  if (!Array.isArray(value) || value.length !== defaultModuleOrder.length) {
    return false;
  }

  return defaultModuleOrder.every((key) => value.includes(key));
}

function loadModuleOrder(): TodayModuleKey[] {
  if (typeof window === 'undefined') {
    return defaultModuleOrder;
  }

  try {
    const rawValue = window.localStorage.getItem(TODAY_LAYOUT_STORAGE_KEY);

    if (!rawValue) {
      return defaultModuleOrder;
    }

    const parsed = JSON.parse(rawValue) as unknown;

    return isValidModuleOrder(parsed) ? parsed : defaultModuleOrder;
  } catch {
    return defaultModuleOrder;
  }
}

function normalizeTodayInput(input: TaskFormInput): TaskFormInput {
  return {
    title: input.title.trim(),
    deadline: input.deadline ?? dayjs().endOf('day').toISOString(),
  };
}

function isTaskStillInToday(task: TaskItem) {
  return Boolean(getTodayTasks([task]).length);
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export function TodayPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted } =
    useTasksContext();
  const pomodoroApi = usePomodoroContext();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<TaskFilterValue>('all');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isCompletedCollapsed, setIsCompletedCollapsed] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(
    null,
  );
  const [moduleOrder, setModuleOrder] = useState<TodayModuleKey[]>(loadModuleOrder);
  const [draggingModule, setDraggingModule] = useState<TodayModuleKey | null>(null);

  const composerRef = useRef<HTMLElement | null>(null);
  const taskBoardRef = useRef<HTMLElement | null>(null);

  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks]);

  const overdueTasks = useMemo(
    () =>
      todayTasks.filter((task) => isTaskDateOverdue(task.deadline, task.completed)),
    [todayTasks],
  );
  const activeTasks = useMemo(
    () =>
      todayTasks.filter(
        (task) => !task.completed && !isTaskDateOverdue(task.deadline, task.completed),
      ),
    [todayTasks],
  );
  const completedTasks = useMemo(
    () => todayTasks.filter((task) => task.completed),
    [todayTasks],
  );

  const focusTask = overdueTasks[0] ?? activeTasks[0] ?? null;
  const completionRate = todayTasks.length
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  const filterCounts = useMemo(
    () => ({
      all: todayTasks.length,
      active: overdueTasks.length + activeTasks.length,
      completed: completedTasks.length,
    }),
    [activeTasks.length, completedTasks.length, overdueTasks.length, todayTasks.length],
  );

  useEffect(() => {
    window.localStorage.setItem(
      TODAY_LAYOUT_STORAGE_KEY,
      JSON.stringify(moduleOrder),
    );
  }, [moduleOrder]);

  const visibleSelectedTaskIds = useMemo(
    () =>
      selectedTaskIds.filter((taskId) =>
        todayTasks.some((task) => task.id === taskId),
      ),
    [selectedTaskIds, todayTasks],
  );

  const activeEditingTask = useMemo(
    () =>
      editingTask
        ? todayTasks.find((task) => task.id === editingTask.id) ?? null
        : null,
    [editingTask, todayTasks],
  );

  const selectedTasks = useMemo(
    () => todayTasks.filter((task) => visibleSelectedTaskIds.includes(task.id)),
    [todayTasks, visibleSelectedTaskIds],
  );

  const selectedActiveCount = selectedTasks.filter((task) => !task.completed).length;
  const selectedCompletedCount = selectedTasks.filter((task) => task.completed).length;

  const handleTaskSubmit = (input: TaskFormInput) => {
    const normalizedInput = normalizeTodayInput(input);

    if (activeEditingTask) {
      const updatedTask: TaskItem = {
        ...activeEditingTask,
        title: normalizedInput.title,
        deadline: normalizedInput.deadline,
      };

      updateTask(activeEditingTask.id, normalizedInput);
      setEditingTask(null);

      if (isTaskStillInToday(updatedTask)) {
        showToast('已保存修改。');
      } else {
        showToast('已保存，这条任务已移出今日任务。', 'info');
      }

      return;
    }

    addTask(normalizedInput);
    showToast('已记到今天。');
  };

  const handleToggleTaskCompleted = (taskId: string) => {
    const targetTask = todayTasks.find((task) => task.id === taskId);

    if (!targetTask) {
      return;
    }

    toggleTaskCompleted(taskId);
    showToast(targetTask.completed ? '已恢复到待处理。' : '已标记为完成。');
  };

  const handleSelectChange = (taskId: string, selected: boolean) => {
    setSelectedTaskIds((currentIds) => {
      if (selected) {
        return currentIds.includes(taskId) ? currentIds : [...currentIds, taskId];
      }

      return currentIds.filter((currentId) => currentId !== taskId);
    });
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);

    window.setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleDeleteRequest = (task: TaskItem) => {
    setPendingDelete({ type: 'single', task, taskIds: [task.id] });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    pendingDelete.taskIds.forEach((taskId) => {
      if (activeEditingTask?.id === taskId) {
        setEditingTask(null);
      }

      deleteTask(taskId);
    });

    setSelectedTaskIds((currentIds) =>
      currentIds.filter((taskId) => !pendingDelete.taskIds.includes(taskId)),
    );

    showToast(
      pendingDelete.type === 'batch'
        ? `已移除 ${pendingDelete.taskIds.length} 条任务。`
        : '已移除这条任务。',
    );
    setPendingDelete(null);
  };

  const handleBatchComplete = () => {
    selectedTasks
      .filter((task) => !task.completed)
      .forEach((task) => toggleTaskCompleted(task.id));

    if (selectedActiveCount) {
      showToast(`已完成 ${selectedActiveCount} 条任务。`);
    }

    setSelectedTaskIds([]);
  };

  const handleBatchRestore = () => {
    selectedTasks
      .filter((task) => task.completed)
      .forEach((task) => toggleTaskCompleted(task.id));

    if (selectedCompletedCount) {
      showToast(`已恢复 ${selectedCompletedCount} 条任务。`, 'info');
    }

    setSelectedTaskIds([]);
  };

  const handleLocateFocusTask = () => {
    taskBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const moveModule = (moduleKey: TodayModuleKey, direction: 'up' | 'down') => {
    setModuleOrder((currentOrder) => {
      const currentIndex = currentOrder.indexOf(moduleKey);

      if (currentIndex === -1) {
        return currentOrder;
      }

      const targetIndex =
        direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentOrder.length) {
        return currentOrder;
      }

      return moveItem(currentOrder, currentIndex, targetIndex);
    });
  };

  const handleDragStart = (moduleKey: TodayModuleKey) => {
    setDraggingModule(moduleKey);
  };

  const handleDrop = (targetModuleKey: TodayModuleKey) => {
    if (!draggingModule || draggingModule === targetModuleKey) {
      setDraggingModule(null);
      return;
    }

    setModuleOrder((currentOrder) => {
      const fromIndex = currentOrder.indexOf(draggingModule);
      const toIndex = currentOrder.indexOf(targetModuleKey);

      if (fromIndex === -1 || toIndex === -1) {
        return currentOrder;
      }

      return moveItem(currentOrder, fromIndex, toIndex);
    });
    setDraggingModule(null);
  };

  const topSummaryText = focusTask
    ? `下一步先处理「${focusTask.title}」`
    : todayTasks.length
      ? '今天的任务已经完成得差不多了。'
      : '今天还没排任务，先记一条最重要的事。';

  const renderModule = (moduleKey: TodayModuleKey, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < moduleOrder.length - 1;

    const moduleChrome = (
      eyebrow: string,
      title: string,
      content: ReactNode,
    ) => (
      <article
        className={`today-module-card ${
          draggingModule === moduleKey ? 'today-module-card-dragging' : ''
        }`}
        draggable
        onDragStart={() => handleDragStart(moduleKey)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => handleDrop(moduleKey)}
      >
        <div className="today-module-head">
          <div>
            <p className="today-module-eyebrow">{eyebrow}</p>
            <h2 className="section-title">{title}</h2>
          </div>
          <div className="today-module-tools">
            <span className="today-drag-handle" aria-hidden="true">
              拖动
            </span>
            <button
              className="today-order-button"
              type="button"
              onClick={() => moveModule(moduleKey, 'up')}
              disabled={!canMoveUp}
            >
              上移
            </button>
            <button
              className="today-order-button"
              type="button"
              onClick={() => moveModule(moduleKey, 'down')}
              disabled={!canMoveDown}
            >
              下移
            </button>
          </div>
        </div>
        {content}
      </article>
    );

    if (moduleKey === 'focus') {
      return moduleChrome(
        '现在先做',
        focusTask ? focusTask.title : '先排出今天最重要的一件事',
        focusTask ? (
          <div className="today-focus-body">
            <p className="today-focus-copy">
              {isTaskDateOverdue(focusTask.deadline, focusTask.completed)
                ? '这条任务已经逾期，建议先把它收掉。'
                : '这是当前最接近截止时间的待处理任务。'}
            </p>
            <div className="today-focus-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={handleLocateFocusTask}
              >
                定位到列表
              </button>
              <Link className="button button-secondary" to="/pomodoro">
                开始专注
              </Link>
            </div>
          </div>
        ) : (
          <div className="today-focus-body">
            <p className="today-focus-copy">
              今天的列表还是空的。先记一条最重要的任务，后面我们再慢慢补齐。
            </p>
            <button
              className="button button-primary"
              type="button"
              onClick={() =>
                composerRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            >
              现在就记一条
            </button>
          </div>
        ),
      );
    }

    if (moduleKey === 'composer') {
      return (
        <div
          ref={(node) => {
            composerRef.current = node;
          }}
        >
          {moduleChrome(
            activeEditingTask ? '正在修改' : '快速新增',
            activeEditingTask ? activeEditingTask.title : '把今天要做的事记下来',
            <>
              <p className="section-description">
                {activeEditingTask
                  ? '保存后，今日列表会立即更新。如果你把时间改到明天，这条任务会自动离开今日页。'
                  : '先记标题和时间就够了，系统会自动保存到本地。'}
              </p>
              <TodayQuickAddForm
                key={activeEditingTask?.id ?? 'today-quick-create'}
                initialTask={activeEditingTask}
                onSubmit={handleTaskSubmit}
                onCancel={() => setEditingTask(null)}
              />
            </>,
          )}
        </div>
      );
    }

    return moduleChrome(
      '专注入口',
      '把下一段时间留给一件事',
      <div className="today-pomodoro-card">
        <div className="today-pomodoro-meta">
          <div>
            <span className="today-pomodoro-label">当前状态</span>
            <strong>{formatPomodoroStatus(pomodoroApi.pomodoro.status)}</strong>
          </div>
          <div>
            <span className="today-pomodoro-label">剩余时间</span>
            <strong>{formatTime(pomodoroApi.pomodoro.remainingSeconds)}</strong>
          </div>
        </div>
        <p className="today-focus-copy">
          当你已经知道接下来先做什么时，直接开始一个番茄钟会更容易进入状态。
        </p>
        <Link className="button button-primary" to="/pomodoro">
          打开番茄钟
        </Link>
      </div>,
    );
  };

  return (
    <div className="page-stack today-page">
      <section className="today-hero panel">
        <div className="today-hero-content">
          <p className="today-hero-kicker">Today workbench</p>
          <h1 className="today-hero-title">今天</h1>
          <p className="today-hero-description">{topSummaryText}</p>
          <div className="today-hero-actions">
            <Link className="button button-primary" to="/week">
              查看本周安排
            </Link>
            <Link className="button button-secondary" to="/">
              回到总览
            </Link>
          </div>
        </div>

        <aside className="today-progress-panel" aria-label="今日完成进度">
          <div
            className="today-progress-ring"
            style={
              {
                '--today-progress': `${completionRate}%`,
              } as CSSProperties
            }
          >
            <div className="today-progress-inner">
              <strong>{completionRate}%</strong>
              <span>完成率</span>
            </div>
          </div>
          <div className="today-progress-stats">
            <div>
              <span>待处理</span>
              <strong>{filterCounts.active}</strong>
            </div>
            <div>
              <span>已完成</span>
              <strong>{filterCounts.completed}</strong>
            </div>
            <div>
              <span>逾期</span>
              <strong>{overdueTasks.length}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="today-summary-grid" aria-label="今日概览">
        <article className="today-summary-card">
          <span>今天相关任务</span>
          <strong>{todayTasks.length}</strong>
          <p>含今天到期和已逾期任务</p>
        </article>
        <article className="today-summary-card">
          <span>下一步建议</span>
          <strong>{focusTask ? '先收掉一条' : '先新增一条'}</strong>
          <p>{focusTask ? focusTask.title : '把今天最重要的任务先写下来'}</p>
        </article>
        <article className="today-summary-card">
          <span>当前节奏</span>
          <strong>{formatPomodoroStatus(pomodoroApi.pomodoro.status)}</strong>
          <p>剩余 {formatTime(pomodoroApi.pomodoro.remainingSeconds)}</p>
        </article>
      </section>

      <section className="today-modules-grid" aria-label="今日功能模块">
        {moduleOrder.map((moduleKey, index) => (
          <div key={moduleKey}>{renderModule(moduleKey, index)}</div>
        ))}
      </section>

      <section className="panel today-task-board-panel" ref={taskBoardRef}>
        <div className="today-task-toolbar">
          <div>
            <h2 className="section-title">今天的任务板</h2>
            <p className="section-description">
              先看逾期，再处理今天要完成的事。已完成的内容默认收起，避免打扰。
            </p>
          </div>
          <TodayFilterTabs
            value={filter}
            onChange={setFilter}
            counts={filterCounts}
          />
        </div>

        {visibleSelectedTaskIds.length ? (
          <div className="today-batch-bar" role="status" aria-live="polite">
            <div>
              <strong>已选择 {visibleSelectedTaskIds.length} 条任务</strong>
              <p>可以批量完成、恢复或移除，减少重复点击。</p>
            </div>
            <div className="today-batch-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={handleBatchComplete}
                disabled={!selectedActiveCount}
              >
                批量做完
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={handleBatchRestore}
                disabled={!selectedCompletedCount}
              >
                恢复待处理
              </button>
              <button
                className="button button-danger"
                type="button"
                onClick={() =>
                  setPendingDelete({
                    type: 'batch',
                    taskIds: visibleSelectedTaskIds,
                  })
                }
              >
                批量移除
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setSelectedTaskIds([])}
              >
                清空选择
              </button>
            </div>
          </div>
        ) : null}

        {!todayTasks.length ? (
          <EmptyState
            title="今天还没排任务"
            description="先记一条今天要做的事，或者把已有任务的截止时间安排到今天。"
          />
        ) : (
          <div id="today-task-board" className="today-sections-stack">
            {filter !== 'completed' ? (
              <TodayTaskSection
                id="today-overdue"
                title="需要先处理"
                description="这些任务已经逾期，建议优先清掉。"
                tasks={overdueTasks}
                selectedTaskIds={visibleSelectedTaskIds}
                onSelectChange={handleSelectChange}
                onToggleTaskCompleted={handleToggleTaskCompleted}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteRequest}
                emptyTitle="没有逾期任务"
                emptyDescription="很好，今天可以把注意力放在按计划推进上。"
              />
            ) : null}

            {filter !== 'completed' ? (
              <TodayTaskSection
                id="today-active"
                title="今天待处理"
                description="这是今天还没完成的任务，按截止时间从近到远排序。"
                tasks={activeTasks}
                selectedTaskIds={visibleSelectedTaskIds}
                onSelectChange={handleSelectChange}
                onToggleTaskCompleted={handleToggleTaskCompleted}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteRequest}
                emptyTitle="今天待处理列表是空的"
                emptyDescription="如果逾期区也没有任务，说明今天已经处理得不错了。"
              />
            ) : null}

            {filter !== 'active' ? (
              <TodayTaskSection
                id="today-completed"
                title="今天已完成"
                description="先默认收起来，减少视觉噪音；需要回顾时再展开。"
                tasks={completedTasks}
                selectedTaskIds={visibleSelectedTaskIds}
                onSelectChange={handleSelectChange}
                onToggleTaskCompleted={handleToggleTaskCompleted}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteRequest}
                emptyTitle="今天还没有完成项"
                emptyDescription="完成一条后，这里会自动出现。"
                collapsible
                collapsed={isCompletedCollapsed}
                onToggleCollapsed={() =>
                  setIsCompletedCollapsed((currentValue) => !currentValue)
                }
              />
            ) : null}
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title={
          pendingDelete?.type === 'batch' ? '确认批量移除任务' : '确认移除任务'
        }
        description={
          pendingDelete?.type === 'batch'
            ? `确认移除这 ${pendingDelete.taskIds.length} 条任务吗？移除后将无法自动恢复。`
            : `确认移除“${pendingDelete?.task?.title ?? ''}”吗？移除后将无法自动恢复。`
        }
        confirmLabel="移除"
        cancelLabel="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
