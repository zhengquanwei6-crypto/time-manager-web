import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { TaskFilters } from '../components/task/TaskFilters';
import { TaskForm } from '../components/task/TaskForm';
import { TaskList } from '../components/task/TaskList';
import { useTasksContext } from '../contexts/TasksContext';
import { useToast } from '../contexts/ToastContext';
import type { TaskFilterValue, TaskFormInput, TaskItem } from '../types/task';
import { filterTasksByStatus, getWeekTaskGroups } from '../utils/task';

export function WeekPage() {
  const { tasks, updateTask, deleteTask, toggleTaskCompleted } =
    useTasksContext();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<TaskFilterValue>('all');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const groups = useMemo(
    () =>
      getWeekTaskGroups(tasks)
        .map((group) => ({
          ...group,
          tasks: filterTasksByStatus(group.tasks, filter),
        }))
        .filter((group) => group.tasks.length > 0),
    [tasks, filter],
  );

  const handleSubmit = (input: TaskFormInput) => {
    if (editingTask) {
      updateTask(editingTask.id, input);
      setEditingTask(null);
      showToast('任务已更新');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }

    deleteTask(taskId);
    showToast('任务已删除');
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="本周视图"
        description="这里按日期分组展示本周任务，帮助你确认本周安排和统计页中的数据是否一致。"
      />

      <section className="two-column-grid">
        <div className="panel">
          <h3 className="section-title">
            {editingTask ? '编辑本周任务' : '页面说明'}
          </h3>
          {editingTask ? (
            <>
              <p className="section-description">
                保存后，本周分组和其他页面会立刻按新的截止时间重新刷新。
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
                本周页先专注做查看和整理。新增任务建议在任务总览完成，再回到这里检查分组是否正确。
              </p>
              <Link className="button button-primary inline-link-button" to="/">
                去任务总览新增任务
              </Link>
            </>
          )}
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
          description="可以先去任务总览新增一条本周截止的任务，再回来看这里的分组展示。"
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
              onDeleteTask={handleDeleteTask}
            />
          </section>
        ))
      )}
    </div>
  );
}
