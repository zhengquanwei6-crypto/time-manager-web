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
import { calculateTaskStats } from '../utils/stats';
import { getRecentTasks } from '../utils/task';

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
    resetTasks,
  } = tasksApi;
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const stats = calculateTaskStats(tasks);
  const recentTasks = getRecentTasks(tasks, 5);

  const handleSubmit = (input: TaskFormInput) => {
    if (editingTask) {
      updateTask(editingTask.id, input);
      setEditingTask(null);
      return;
    }

    addTask(input);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        description="这里先展示项目首页的基础结构：摘要卡片、任务表单、最近任务和番茄钟入口。"
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
          <div className="section-header">
            <div>
              <h3 className="section-title">
                {editingTask ? '编辑任务' : '快速新增任务'}
              </h3>
              <p className="section-description">
                第一版先保留最基础的任务表单，只输入标题和截止时间。
              </p>
            </div>
            <button
              className="button button-secondary"
              type="button"
              onClick={resetTasks}
            >
              恢复 mock 数据
            </button>
          </div>

          <TaskForm
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
              <strong>{pomodoroApi.pomodoro.status}</strong>
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
            <h3 className="section-title">最近任务</h3>
            <p className="section-description">
              这里使用 mock 数据作为第一版骨架展示，也支持基础增删改和完成切换。
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
          tasks={recentTasks}
          emptyTitle="还没有任务"
          emptyDescription="先新增一条任务，页面骨架就会开始展示真实内容。"
          onToggleTaskCompleted={toggleTaskCompleted}
          onEditTask={setEditingTask}
          onDeleteTask={deleteTask}
        />
      </section>
    </div>
  );
}
