import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/stats/StatCard';
import { TaskForm } from '../components/task/TaskForm';
import { TaskList } from '../components/task/TaskList';
import type { UsePomodoroResult } from '../hooks/usePomodoro';
import type { UseTasksResult } from '../hooks/useTasks';
import type { TaskFormInput, TaskItem } from '../types/task';
import { formatTime } from '../utils/date';
import { formatPomodoroStatus } from '../utils/pomodoro';
import { calculateTaskStats } from '../utils/stats';

interface DashboardPageProps {
  tasksApi: UseTasksResult;
  pomodoroApi: UsePomodoroResult;
}

export function DashboardPage({
  tasksApi,
  pomodoroApi,
}: DashboardPageProps) {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
  } = tasksApi;
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const stats = calculateTaskStats(tasks);

  const handleSubmit = (input: TaskFormInput) => {
    if (editingTask) {
      updateTask(editingTask.id, input);
      setEditingTask(null);
      return;
    }

    addTask(input);
  };

  const handleDeleteTask = (taskId: string) => {
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }

    deleteTask(taskId);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="任务总览"
        description="这里作为第一条可用闭环的主入口：新增任务、查看列表、切换完成状态，都先在这个页面完成。"
      />

      <section className="stats-grid">
        <StatCard label="总任务数" value={stats.totalCount} description="当前任务总数" />
        <StatCard
          label="已完成"
          value={stats.completedCount}
          description="已经完成的任务数量"
        />
        <StatCard
          label="今日完成"
          value={stats.todayCompletedCount}
          description="今天完成的任务数量"
        />
        <StatCard
          label="完成率"
          value={`${stats.completionRate}%`}
          description="根据当前任务即时计算"
        />
      </section>

      <section className="two-column-grid">
        <div className="panel">
          <h3 className="section-title">
            {editingTask ? '编辑任务' : '新增任务'}
          </h3>
          <p className="section-description">
            第一版先保留最基础的任务表单，只输入标题和截止时间。提交后，下面的任务列表会立即刷新。
          </p>

          <TaskForm
            key={editingTask?.id ?? 'dashboard-create-task'}
            initialTask={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />
        </div>

        <div className="panel">
          <h3 className="section-title">番茄钟概览</h3>
          <p className="section-description">
            这里先展示基础倒计时状态，完整操作在番茄钟页中进行。
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

      <section className="panel">
        <div className="section-header">
          <div>
            <h3 className="section-title">任务列表</h3>
            <p className="section-description">
              这里展示当前所有任务。你可以直接勾选完成，页面会立即更新，刷新浏览器后数据也会保留。
            </p>
          </div>
          <div className="section-link-group">
            <Link className="text-link" to="/today">
              去今日视图
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
