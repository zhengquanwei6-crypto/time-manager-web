import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { TaskFilters } from '../components/task/TaskFilters';
import { TaskForm } from '../components/task/TaskForm';
import { TaskList } from '../components/task/TaskList';
import type { UseTasksResult } from '../hooks/useTasks';
import type { TaskFilterValue, TaskFormInput, TaskItem } from '../types/task';
import { filterTasksByStatus, getTodayTasks } from '../utils/task';

interface TodayPageProps {
  tasksApi: UseTasksResult;
}

export function TodayPage({ tasksApi }: TodayPageProps) {
  const { tasks, updateTask, deleteTask, toggleTaskCompleted } = tasksApi;
  const [filter, setFilter] = useState<TaskFilterValue>('all');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const todayTasks = filterTasksByStatus(getTodayTasks(tasks), filter);

  const handleSubmit = (input: TaskFormInput) => {
    if (editingTask) {
      updateTask(editingTask.id, input);
      setEditingTask(null);
    }
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
        title="今日视图"
        description="这里专注查看今天到期和已逾期的任务，保证今日页和统计页看到的是同一份任务数据。"
      />

      <section className="two-column-grid">
        <div className="panel">
          <h3 className="section-title">
            {editingTask ? '编辑今日任务' : '页面说明'}
          </h3>
          {editingTask ? (
            <>
              <p className="section-description">
                在这里修改任务后，今日列表、任务总览和统计页都会立即同步更新。
              </p>
              <TaskForm
                key={editingTask.id}
                initialTask={editingTask}
                onSubmit={handleSubmit}
                onCancel={() => setEditingTask(null)}
              />
            </>
          ) : (
            <>
              <p className="section-description">
                今日页主要用于查看和处理今天相关的任务。新增任务建议在任务总览完成，这样更不容易出现“刚新增但当前页看不到”的误会。
              </p>
              <Link className="button button-primary inline-link-button" to="/">
                去任务总览新增任务
              </Link>
            </>
          )}
        </div>

        <div className="panel">
          <h3 className="section-title">筛选器</h3>
          <p className="section-description">
            第一版先提供全部、未完成、已完成三种简单筛选。
          </p>
          <TaskFilters value={filter} onChange={setFilter} />
        </div>
      </section>

      <section className="panel">
        <h3 className="section-title">今日任务列表</h3>
        <TaskList
          tasks={todayTasks}
          emptyTitle="今天还没有任务"
          emptyDescription="如果你刚新增了任务，请确认截止时间是否在今天，或者先去任务总览查看完整任务列表。"
          onToggleTaskCompleted={toggleTaskCompleted}
          onEditTask={setEditingTask}
          onDeleteTask={handleDeleteTask}
        />
      </section>
    </div>
  );
}
