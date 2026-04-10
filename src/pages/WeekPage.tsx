import { useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { TaskFilters } from '../components/task/TaskFilters';
import { TaskForm } from '../components/task/TaskForm';
import { TaskList } from '../components/task/TaskList';
import type { UseTasksResult } from '../hooks/useTasks';
import type { TaskFilterValue, TaskFormInput, TaskItem } from '../types/task';
import { filterTasksByStatus, getWeekTaskGroups } from '../utils/task';

interface WeekPageProps {
  tasksApi: UseTasksResult;
}

export function WeekPage({ tasksApi }: WeekPageProps) {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompleted } = tasksApi;
  const [filter, setFilter] = useState<TaskFilterValue>('all');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const groups = getWeekTaskGroups(tasks)
    .map((group) => ({
      ...group,
      tasks: filterTasksByStatus(group.tasks, filter),
    }))
    .filter((group) => group.tasks.length > 0);

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
        title="本周视图"
        description="这里先按日期分组展示本周任务，让页面结构和后续分组逻辑先确定下来。"
      />

      <section className="two-column-grid">
        <div className="panel">
          <h3 className="section-title">
            {editingTask ? '编辑本周任务' : '新增任务'}
          </h3>
          <p className="section-description">
            先复用任务表单，后续如果需要再把新增入口收敛到某一个页面。
          </p>
          <TaskForm
            initialTask={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />
        </div>

        <div className="panel">
          <h3 className="section-title">本周筛选</h3>
          <p className="section-description">先做最简单的状态筛选，不增加复杂排序。</p>
          <TaskFilters value={filter} onChange={setFilter} />
        </div>
      </section>

      {groups.length === 0 ? (
        <EmptyState
          title="本周还没有任务"
          description="可以先新增一条本周截止的任务，或者保留当前骨架继续开发。"
        />
      ) : (
        groups.map((group) => (
          <section key={group.dateKey} className="panel">
            <h3 className="section-title">{group.label}</h3>
            <TaskList
              tasks={group.tasks}
              emptyTitle="当前分组没有任务"
              emptyDescription="这一组数据暂时为空。"
              onToggleTaskCompleted={toggleTaskCompleted}
              onEditTask={setEditingTask}
              onDeleteTask={deleteTask}
            />
          </section>
        ))
      )}
    </div>
  );
}
