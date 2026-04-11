import { useMemo } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/stats/StatCard';
import { useTasksContext } from '../contexts/TasksContext';
import { calculateTaskStats } from '../utils/stats';

export function StatsPage() {
  const { tasks } = useTasksContext();
  const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);

  return (
    <div className="page-stack">
      <PageHeader
        title="完成统计"
        description="这里直接基于当前任务数据实时计算结果，所以其他页面的增删改查会立即同步到这里。"
      />

      <section className="stats-grid">
        <StatCard label="总任务数" value={stats.totalCount} description="所有任务数量" />
        <StatCard label="已完成" value={stats.completedCount} description="已完成任务数量" />
        <StatCard label="未完成" value={stats.activeCount} description="仍待处理的任务数量" />
        <StatCard
          label="今日完成"
          value={stats.todayCompletedCount}
          description="今天完成的任务数量"
        />
        <StatCard
          label="本周完成"
          value={stats.weekCompletedCount}
          description="本周完成的任务数量"
        />
        <StatCard
          label="完成率"
          value={`${stats.completionRate}%`}
          description="基于当前任务列表实时计算"
        />
      </section>
    </div>
  );
}
