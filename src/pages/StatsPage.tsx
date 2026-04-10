import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/stats/StatCard';
import type { UseTasksResult } from '../hooks/useTasks';
import { calculateTaskStats } from '../utils/stats';

interface StatsPageProps {
  tasksApi: UseTasksResult;
}

export function StatsPage({ tasksApi }: StatsPageProps) {
  const stats = calculateTaskStats(tasksApi.tasks);

  return (
    <div className="page-stack">
      <PageHeader
        title="统计页"
        description="这里直接基于当前任务数据计算结果，所以任务在其他页面的新增、编辑、删除和完成状态都会同步反映在这里。"
      />

      <section className="stats-grid">
        <StatCard label="总任务数" value={stats.totalCount} description="所有任务数量" />
        <StatCard label="已完成" value={stats.completedCount} description="已完成任务数量" />
        <StatCard label="未完成" value={stats.activeCount} description="还待处理的任务" />
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
