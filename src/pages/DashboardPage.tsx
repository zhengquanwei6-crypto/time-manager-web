import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/stats/StatCard';
import { TaskForm } from '../components/task/TaskForm';
import { TaskList } from '../components/task/TaskList';
import { usePomodoroContext } from '../contexts/PomodoroContext';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import type { TaskFormInput, TaskItem } from '../types/task';
import { formatTime } from '../utils/date';
import { formatPomodoroStatus } from '../utils/pomodoro';
import { calculateTaskStats } from '../utils/stats';
import { getTodayTasks } from '../utils/task';

export function DashboardPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted } =
    useTasksContext();
  const pomodoroApi = usePomodoroContext();
  const { showToast } = useToast();
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);
  const todayTasks = useMemo(() => getTodayTasks(tasks), [tasks]);
  const todayActiveCount = useMemo(
    () => todayTasks.filter((task) => !task.completed).length,
    [todayTasks],
  );

  const handleSubmit = (input: TaskFormInput) => {
    if (editingTask) {
      updateTask(editingTask.id, input);
      setEditingTask(null);
      showToast('任务已更新');
      return;
    }

    addTask(input);
    showToast('任务已新增');
  };

  const handleDeleteTask = (taskId: string) => {
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }

    deleteTask(taskId);
    showToast('任务已移除', 'info');
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="任务仪表盘"
        description="这里是最适合开始一天工作的入口。你可以快速新增任务、查看今天的节奏，并直接处理当前任务列表。"
      />

      <section className="panel dashboard-overview">
        <div className="section-header">
          <div>
            <h3 className="section-title">今日概览</h3>
            <p className="section-description">
              先看清今天有多少任务、还剩多少待处理，再进入更聚焦的今日任务页。
            </p>
          </div>
          <Link className="text-link" to="/today">
            打开今日任务页
          </Link>
        </div>
        <div className="overview-grid">
          <div className="overview-item">
            <span className="overview-label">今日相关任务</span>
            <strong className="overview-value">{todayTasks.length}</strong>
          </div>
          <div className="overview-item">
            <span className="overview-label">今日待处理</span>
            <strong className="overview-value">{todayActiveCount}</strong>
          </div>
          <div className="overview-item">
            <span className="overview-label">今日已完成</span>
            <strong className="overview-value">{stats.todayCompletedCount}</strong>
          </div>
        </div>
      </section>

      <section className="stats-grid dashboard-stats">
        <StatCard label="总任务数" value={stats.totalCount} description="当前任务总量" />
        <StatCard
          label="已完成"
          value={stats.completedCount}
          description="已经完成的任务数量"
        />
        <StatCard
          label="今日完成"
          value={stats.todayCompletedCount}
          description="今天已经完成的任务数量"
        />
        <StatCard
          label="完成率"
          value={`${stats.completionRate}%`}
          description="根据当前任务实时计算"
        />
      </section>

      <section className="two-column-grid dashboard-main-grid">
        <div className="panel dashboard-form-panel">
          <h3 className="section-title">
            {editingTask ? '编辑任务' : '新增任务'}
          </h3>
          <p className="section-description">
            先用最轻量的方式记下要做的事。提交后，下方任务列表会立即刷新。
          </p>

          <TaskForm
            key={editingTask?.id ?? 'dashboard-create-task'}
            initialTask={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />
        </div>

        <div className="panel dashboard-pomodoro-panel">
          <h3 className="section-title">番茄钟概览</h3>
          <p className="section-description">
            这里先显示当前倒计时状态。完整专注操作可以在番茄钟页继续进行。
          </p>
          <div className="info-list">
            <div className="info-row">
              <span>当前状态</span>
              <strong>{formatPomodoroStatus(pomodoroApi.pomodoro.status)}</strong>
            </div>
            <div className="info-row">
              <span>剩余时间</span>
              <strong>{formatTime(pomodoroApi.pomodoro.remainingSeconds)}</strong>
            </div>
          </div>
          <Link className="button button-primary inline-link-button" to="/pomodoro">
            进入番茄钟页
          </Link>
        </div>
      </section>

      <section className="panel dashboard-tasks-panel">
        <div className="section-header">
          <div>
            <h3 className="section-title">当前任务列表</h3>
            <p className="section-description">
              这里展示当前所有任务。你可以直接勾选完成、修改内容，或移除不再需要的任务。
            </p>
          </div>
          <div className="section-link-group">
            <Link className="text-link" to="/today">
              去今日任务页
            </Link>
            <Link className="text-link" to="/week">
              去本周视图
            </Link>
          </div>
        </div>

        <TaskList
          tasks={tasks}
          emptyTitle="还没有任务"
          emptyDescription="先在上方新增一条任务，列表会立刻显示出来。"
          onToggleTaskCompleted={toggleTaskCompleted}
          onEditTask={setEditingTask}
          onDeleteTask={handleDeleteTask}
        />
      </section>
    </div>
  );
}
