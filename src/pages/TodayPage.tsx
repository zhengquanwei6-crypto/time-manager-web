import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { TodayQuickAddForm } from '../components/today/TodayQuickAddForm';
import { TodaySummarySidebar } from '../components/today/TodaySummarySidebar';
import { TodayTaskCard } from '../components/today/TodayTaskCard';
import { VirtualTaskList } from '../components/today/VirtualTaskList';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import type {
  TaskFilterValue,
  TaskFormInput,
  TaskItem,
  TaskPriority,
  TaskPriorityFilterValue,
  TaskSortValue,
} from '../types/task';
import {
  filterTasksByPriority,
  filterTasksByStatus,
  getCoreTodayTask,
  getTodayTasks,
  sortTasksForToday,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_OPTIONS,
} from '../utils/task';

interface PendingDeleteState {
  taskIds: string[];
  title: string;
}

function isTaskStillInToday(task: TaskItem) {
  return Boolean(getTodayTasks([task]).length);
}

function getPriorityDescription(priority: TaskPriority) {
  if (priority === 'high') {
    return '今天优先处理';
  }

  if (priority === 'medium') {
    return '今天正常推进';
  }

  return '可以稍后处理';
}

export function TodayPage() {
  const {
    tasks,
    addTask,
    updateTask,
    updateTaskPriority,
    deleteTask,
    toggleTaskCompleted,
  } = useTasksContext();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<TaskFilterValue>('all');
  const [priorityFilter, setPriorityFilter] =
    useState<TaskPriorityFilterValue>('all');
  const [sortValue, setSortValue] = useState<TaskSortValue>('recommended');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(
    null,
  );
  const [recentlyAddedTaskId, setRecentlyAddedTaskId] = useState<string | null>(
    null,
  );
  const [recentlyCompletedTaskId, setRecentlyCompletedTaskId] = useState<
    string | null
  >(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [activeDropPriority, setActiveDropPriority] =
    useState<TaskPriority | null>(null);
  const [liveMessage, setLiveMessage] = useState('');

  const listHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks]);
  const activeEditingTask = useMemo(
    () =>
      editingTaskId ? tasks.find((task) => task.id === editingTaskId) ?? null : null,
    [editingTaskId, tasks],
  );

  const filteredTasks = useMemo(() => {
    const statusFilteredTasks = filterTasksByStatus(todayTasks, statusFilter);
    const priorityFilteredTasks = filterTasksByPriority(
      statusFilteredTasks,
      priorityFilter,
    );

    return sortTasksForToday(priorityFilteredTasks, sortValue);
  }, [priorityFilter, sortValue, statusFilter, todayTasks]);

  const deferredTasks = useDeferredValue(filteredTasks);

  const activeTasks = useMemo(
    () => todayTasks.filter((task) => !task.completed),
    [todayTasks],
  );
  const completedTasks = useMemo(
    () => todayTasks.filter((task) => task.completed),
    [todayTasks],
  );
  const completionRate = todayTasks.length
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;
  const coreTask = useMemo(() => getCoreTodayTask(todayTasks), [todayTasks]);
  const priorityCounts = useMemo(
    () => ({
      high: activeTasks.filter((task) => task.priority === 'high').length,
      medium: activeTasks.filter((task) => task.priority === 'medium').length,
      low: activeTasks.filter((task) => task.priority === 'low').length,
    }),
    [activeTasks],
  );

  const selectedVisibleTaskIds = useMemo(
    () =>
      selectedTaskIds.filter((taskId) =>
        todayTasks.some((task) => task.id === taskId),
      ),
    [selectedTaskIds, todayTasks],
  );
  const selectedTasks = useMemo(
    () => todayTasks.filter((task) => selectedVisibleTaskIds.includes(task.id)),
    [selectedVisibleTaskIds, todayTasks],
  );
  const selectedActiveCount = selectedTasks.filter((task) => !task.completed).length;
  const selectedCompletedCount = selectedTasks.filter((task) => task.completed).length;

  const draggingTask = useMemo(
    () =>
      draggingTaskId
        ? todayTasks.find((task) => task.id === draggingTaskId) ?? null
        : null,
    [draggingTaskId, todayTasks],
  );

  useEffect(() => {
    if (!recentlyAddedTaskId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRecentlyAddedTaskId(null);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [recentlyAddedTaskId]);

  useEffect(() => {
    if (!recentlyCompletedTaskId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRecentlyCompletedTaskId(null);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [recentlyCompletedTaskId]);

  const announce = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setLiveMessage(message);
      showToast(message, type);
    },
    [showToast],
  );

  const handleTaskSubmit = useCallback(
    (input: TaskFormInput) => {
      if (activeEditingTask) {
        const updatedTask: TaskItem = {
          ...activeEditingTask,
          title: input.title.trim(),
          deadline: input.deadline,
          priority: input.priority ?? activeEditingTask.priority,
        };

        updateTask(activeEditingTask.id, input);
        setEditingTaskId(null);

        if (isTaskStillInToday(updatedTask)) {
          announce('已保存任务修改。');
        } else {
          announce('已保存，但这条任务已经移出今日任务。', 'info');
        }

        return;
      }

      const createdTask = addTask(input);
      setRecentlyAddedTaskId(createdTask.id);
      announce(
        `已添加任务，并设为 ${TASK_PRIORITY_LABELS[createdTask.priority]} 优先级。`,
      );

      window.setTimeout(() => {
        listHeadingRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 0);
    },
    [activeEditingTask, addTask, announce, updateTask],
  );

  const handleSelectChange = useCallback((taskId: string, selected: boolean) => {
    setSelectedTaskIds((currentIds) => {
      if (selected) {
        return currentIds.includes(taskId) ? currentIds : [...currentIds, taskId];
      }

      return currentIds.filter((currentId) => currentId !== taskId);
    });
  }, []);

  const handleToggleTaskCompleted = useCallback(
    (taskId: string) => {
      const targetTask = todayTasks.find((task) => task.id === taskId);

      if (!targetTask) {
        return;
      }

      toggleTaskCompleted(taskId);
      setRecentlyCompletedTaskId(taskId);
      announce(targetTask.completed ? '已恢复为待处理。' : '已标记为完成。');
    },
    [announce, todayTasks, toggleTaskCompleted],
  );

  const handleEditTask = useCallback((task: TaskItem) => {
    setEditingTaskId(task.id);
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }, []);

  const handleDeleteRequest = useCallback((task: TaskItem) => {
    setPendingDelete({
      taskIds: [task.id],
      title: `确认删除“${task.title}”吗？删除后无法自动恢复。`,
    });
  }, []);

  const handlePriorityChange = useCallback(
    (taskId: string, priority: TaskPriority) => {
      updateTaskPriority(taskId, priority);
      announce(
        `已设为 ${TASK_PRIORITY_LABELS[priority]} 优先级，${getPriorityDescription(priority)}。`,
        'info',
      );
    },
    [announce, updateTaskPriority],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDelete) {
      return;
    }

    pendingDelete.taskIds.forEach((taskId) => {
      deleteTask(taskId);

      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
    });

    setSelectedTaskIds((currentIds) =>
      currentIds.filter((taskId) => !pendingDelete.taskIds.includes(taskId)),
    );

    announce(
      pendingDelete.taskIds.length > 1
        ? `已删除 ${pendingDelete.taskIds.length} 条任务。`
        : '已删除这条任务。',
      'info',
    );
    setPendingDelete(null);
  }, [announce, deleteTask, editingTaskId, pendingDelete]);

  const handleBatchComplete = useCallback(() => {
    selectedTasks
      .filter((task) => !task.completed)
      .forEach((task) => toggleTaskCompleted(task.id));

    if (selectedActiveCount) {
      announce(`已完成 ${selectedActiveCount} 条任务。`);
    }

    setSelectedTaskIds([]);
  }, [announce, selectedActiveCount, selectedTasks, toggleTaskCompleted]);

  const handleBatchRestore = useCallback(() => {
    selectedTasks
      .filter((task) => task.completed)
      .forEach((task) => toggleTaskCompleted(task.id));

    if (selectedCompletedCount) {
      announce(`已恢复 ${selectedCompletedCount} 条任务。`, 'info');
    }

    setSelectedTaskIds([]);
  }, [announce, selectedCompletedCount, selectedTasks, toggleTaskCompleted]);

  const handleBatchPriorityChange = useCallback(
    (priority: TaskPriority) => {
      selectedTasks.forEach((task) => updateTaskPriority(task.id, priority));

      if (selectedTasks.length) {
        announce(
          `已将 ${selectedTasks.length} 条任务设为 ${TASK_PRIORITY_LABELS[priority]} 优先级。`,
          'info',
        );
      }

      setSelectedTaskIds([]);
    },
    [announce, selectedTasks, updateTaskPriority],
  );

  const handleSortChange = useCallback((value: TaskSortValue) => {
    startTransition(() => {
      setSortValue(value);
    });
  }, []);

  const handleStatusFilterChange = useCallback((value: TaskFilterValue) => {
    startTransition(() => {
      setStatusFilter(value);
    });
  }, []);

  const handlePriorityFilterChange = useCallback(
    (value: TaskPriorityFilterValue) => {
      startTransition(() => {
        setPriorityFilter(value);
      });
    },
    [],
  );

  const handlePriorityDrop = useCallback(
    (priority: TaskPriority) => {
      if (!draggingTaskId) {
        return;
      }

      updateTaskPriority(draggingTaskId, priority);
      announce(
        `已把“${draggingTask?.title ?? '任务'}”调整为 ${TASK_PRIORITY_LABELS[priority]} 优先级。`,
        'info',
      );
      setDraggingTaskId(null);
      setActiveDropPriority(null);
    },
    [announce, draggingTask, draggingTaskId, updateTaskPriority],
  );

  const clearDraggingState = useCallback(() => {
    setDraggingTaskId(null);
    setActiveDropPriority(null);
  }, []);

  const statusButtons: Array<{ value: TaskFilterValue; label: string }> = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '待处理' },
    { value: 'completed', label: '已完成' },
  ];

  const priorityButtons: Array<{ value: TaskPriorityFilterValue; label: string }> = [
    { value: 'all', label: '全部优先级' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ];

  return (
    <div className="page-stack today-v2-page">
      <div className="today-v2-live-region" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      <section className="panel today-v2-core today-v2-reveal today-v2-reveal-delay-1">
        <div className="today-v2-core-copy">
          <div className="today-v2-core-topline">
            <span className="today-v2-core-pill today-v2-core-pill-primary">
              今日工作台
            </span>
            <span className="today-v2-core-pill">
              {sortValue === 'recommended' ? '推荐排序已开启' : '正在使用自定义排序'}
            </span>
          </div>
          <p className="today-v2-kicker">今日核心任务</p>
          <h1 className="today-v2-title">
            {coreTask ? coreTask.title : '先安排今天最重要的事'}
          </h1>
          <p className="today-v2-description">
            {coreTask
              ? `建议先处理这条 ${TASK_PRIORITY_LABELS[coreTask.priority]} 优先级任务。它会直接影响今天的推进节奏。`
              : '今天还没有任务。先用下面的表单记下一条最重要的任务，再开始推进。'}
          </p>
          <div className="today-v2-core-highlights">
            <div className="today-v2-core-highlight">
              <span>高优先级</span>
              <strong>{priorityCounts.high}</strong>
            </div>
            <div className="today-v2-core-highlight">
              <span>待处理任务</span>
              <strong>{activeTasks.length}</strong>
            </div>
            <div className="today-v2-core-highlight">
              <span>已完成</span>
              <strong>{completedTasks.length}</strong>
            </div>
          </div>
          <div className="today-v2-core-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() =>
                listHeadingRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            >
              查看今日任务列表
            </button>
            <Link className="button button-secondary" to="/week">
              查看本周安排
            </Link>
          </div>
        </div>

        <div className="today-v2-core-stage">
          <div className="today-v2-core-progress-card">
            <p className="today-v2-core-progress-label">今日推进节奏</p>
            <div
              className="today-v2-core-progress-disc"
              style={{
                background: `conic-gradient(#60a5fa 0 ${completionRate}%, rgba(191, 219, 254, 0.24) ${completionRate}% 100%)`,
              }}
              aria-hidden="true"
            >
              <div className="today-v2-core-progress-disc-inner">
                <strong>{completionRate}%</strong>
                <span>完成率</span>
              </div>
            </div>
            <p className="today-v2-core-progress-note">
              {completedTasks.length > 0
                ? `今天已经完成 ${completedTasks.length} 条任务`
                : '先完成一条任务，建立今天的推进节奏'}
            </p>
          </div>

          <div className="today-v2-core-metrics">
            <div className="today-v2-core-metric">
              <span>今日任务</span>
              <strong>{todayTasks.length}</strong>
            </div>
            <div className="today-v2-core-metric">
              <span>待处理</span>
              <strong>{activeTasks.length}</strong>
            </div>
            <div className="today-v2-core-metric">
              <span>完成率</span>
              <strong>{completionRate}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="today-v2-layout">
        <div className="today-v2-main">
          <section className="panel today-v2-composer today-v2-panel-elevated today-v2-reveal today-v2-reveal-delay-2">
            <div className="today-v2-section-head">
              <div>
                <p className="today-v2-kicker">
                  {activeEditingTask ? '编辑任务' : '新增任务'}
                </p>
                <h2 className="section-title">
                  {activeEditingTask ? '更新当前任务' : '快速添加到今天'}
                </h2>
              </div>
              <span className="today-v2-inline-note">默认带优先级和截止时间</span>
            </div>
            <TodayQuickAddForm
              key={activeEditingTask?.id ?? 'today-v2-create'}
              initialTask={activeEditingTask}
              onSubmit={handleTaskSubmit}
              onCancel={() => setEditingTaskId(null)}
            />
          </section>

          <section className="panel today-v2-toolbar-card today-v2-panel-muted today-v2-reveal today-v2-reveal-delay-3">
            <div className="today-v2-section-head">
              <div>
                <p className="today-v2-kicker">筛选与排序</p>
                <h2 ref={listHeadingRef} className="section-title">
                  今日任务列表
                </h2>
              </div>
              <Link className="text-link" to="/">
                返回仪表盘
              </Link>
            </div>

            <div className="today-v2-toolbar">
              <div className="today-v2-filter-group" role="toolbar" aria-label="状态筛选">
                {statusButtons.map((button) => (
                  <button
                    key={button.value}
                    className={`today-v2-filter-button ${
                      statusFilter === button.value ? 'today-v2-filter-button-active' : ''
                    }`}
                    type="button"
                    aria-pressed={statusFilter === button.value}
                    onClick={() => handleStatusFilterChange(button.value)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>

              <div className="today-v2-filter-group" role="toolbar" aria-label="优先级筛选">
                {priorityButtons.map((button) => (
                  <button
                    key={button.value}
                    className={`today-v2-filter-button ${
                      priorityFilter === button.value
                        ? 'today-v2-filter-button-active'
                        : ''
                    }`}
                    type="button"
                    aria-pressed={priorityFilter === button.value}
                    onClick={() => handlePriorityFilterChange(button.value)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {selectedVisibleTaskIds.length ? (
            <section
              className="panel today-v2-batch-bar today-v2-panel-accent today-v2-reveal today-v2-reveal-delay-4"
              aria-label="批量操作"
            >
              <div>
                <strong>已选择 {selectedVisibleTaskIds.length} 条任务</strong>
                <p>可以一次性完成、恢复、删除，或者直接批量修改优先级。</p>
              </div>

              <div className="today-v2-batch-actions">
                <button
                  className="button button-primary"
                  type="button"
                  disabled={!selectedActiveCount}
                  onClick={handleBatchComplete}
                >
                  批量完成
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={!selectedCompletedCount}
                  onClick={handleBatchRestore}
                >
                  恢复待处理
                </button>
                {TASK_PRIORITY_OPTIONS.map((priority) => (
                  <button
                    key={priority}
                    className="button button-secondary"
                    type="button"
                    onClick={() => handleBatchPriorityChange(priority)}
                  >
                    设为{TASK_PRIORITY_LABELS[priority]}
                  </button>
                ))}
                <button
                  className="button button-danger"
                  type="button"
                  onClick={() =>
                    setPendingDelete({
                      taskIds: selectedVisibleTaskIds,
                      title: `确认删除这 ${selectedVisibleTaskIds.length} 条任务吗？删除后无法自动恢复。`,
                    })
                  }
                >
                  批量删除
                </button>
              </div>
            </section>
          ) : null}

          <section className="panel today-v2-list-card today-v2-panel-elevated today-v2-reveal today-v2-reveal-delay-4">
            {deferredTasks.length === 0 ? (
              <EmptyState
                title="当前筛选下没有任务"
                description="可以切换筛选条件，或者先添加一条新的今日任务。"
              />
            ) : (
              <VirtualTaskList
                items={deferredTasks}
                ariaLabel="今日任务列表"
                getItemKey={(task) => task.id}
                renderItem={(task) => (
                  <TodayTaskCard
                    task={task}
                    selected={selectedVisibleTaskIds.includes(task.id)}
                    isNew={recentlyAddedTaskId === task.id}
                    isCompleting={recentlyCompletedTaskId === task.id}
                    isDragging={draggingTaskId === task.id}
                    onSelectChange={handleSelectChange}
                    onToggleTaskCompleted={handleToggleTaskCompleted}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteRequest}
                    onPriorityChange={handlePriorityChange}
                    onDragStart={setDraggingTaskId}
                    onDragEnd={clearDraggingState}
                  />
                )}
              />
            )}
          </section>
        </div>

        <TodaySummarySidebar
          totalCount={todayTasks.length}
          activeCount={activeTasks.length}
          completedCount={completedTasks.length}
          completionRate={completionRate}
          coreTask={coreTask}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          priorityCounts={priorityCounts}
          selectedCount={selectedVisibleTaskIds.length}
          draggingTaskTitle={draggingTask?.title ?? null}
          activeDropPriority={activeDropPriority}
          onPriorityDragOver={setActiveDropPriority}
          onPriorityDrop={handlePriorityDrop}
          onPriorityDragLeave={() => setActiveDropPriority(null)}
        />
      </section>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="确认删除任务"
        description={pendingDelete?.title ?? ''}
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
