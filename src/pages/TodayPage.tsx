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
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted } = tasksApi;
  const [filter, setFilter] = useState<TaskFilterValue>('all');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const todayTasks = filterTasksByStatus(getTodayTasks(tasks), filter);

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
        title="今日视图"
        description="这里先展示今天到期的任务，并把逾期未完成任务也放到今天页面中。"
      />

      <section className="two-column-grid">
        <div className="panel">
          <h3 className="section-title">
            {editingTask ? '编辑今日任务' : '新增任务'}
          </h3>
          <p className="section-description">
            当前先保留最基础的表单结构，后续可以继续补充校验和交互细节。
          </p>
          <TaskForm
            initialTask={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />
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
          emptyDescription="可以先新增一个今天到期的任务，或者查看 mock 数据的展示效果。"
          onToggleTaskCompleted={toggleTaskCompleted}
          onEditTask={setEditingTask}
          onDeleteTask={deleteTask}
        />
      </section>
    </div>
  );
}
