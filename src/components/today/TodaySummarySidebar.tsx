import type { TaskItem, TaskPriority, TaskSortValue } from '../../types/task';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_OPTIONS } from '../../utils/task';

interface TodaySummarySidebarProps {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  completionRate: number;
  coreTask: TaskItem | null;
  sortValue: TaskSortValue;
  onSortChange: (value: TaskSortValue) => void;
  priorityCounts: Record<TaskPriority, number>;
  selectedCount: number;
  draggingTaskTitle: string | null;
  activeDropPriority: TaskPriority | null;
  onPriorityDragOver: (priority: TaskPriority) => void;
  onPriorityDrop: (priority: TaskPriority) => void;
  onPriorityDragLeave: () => void;
}

const sortOptions: Array<{
  value: TaskSortValue;
  label: string;
  description: string;
}> = [
  {
    value: 'recommended',
    label: '推荐排序',
    description: '综合逾期、优先级和截止时间排序。',
  },
  {
    value: 'priority',
    label: '按优先级',
    description: '高优先级任务排在最前面。',
  },
  {
    value: 'deadline',
    label: '按截止时间',
    description: '越接近截止时间越靠前。',
  },
  {
    value: 'status',
    label: '按状态',
    description: '优先展示仍待处理的任务。',
  },
];

export function TodaySummarySidebar({
  totalCount,
  activeCount,
  completedCount,
  completionRate,
  coreTask,
  sortValue,
  onSortChange,
  priorityCounts,
  selectedCount,
  draggingTaskTitle,
  activeDropPriority,
  onPriorityDragOver,
  onPriorityDrop,
  onPriorityDragLeave,
}: TodaySummarySidebarProps) {
  return (
    <aside className="today-v2-sidebar" aria-label="今日摘要">
      <section className="panel today-v2-summary-card today-v2-summary-card-primary today-v2-reveal today-v2-reveal-delay-2">
        <div className="today-v2-summary-head">
          <div>
            <p className="today-v2-card-kicker">今日摘要</p>
            <h2 className="section-title">完成情况</h2>
          </div>
          <strong className="today-v2-summary-rate">{completionRate}%</strong>
        </div>

        <div
          className="today-v2-progress"
          role="progressbar"
          aria-label="今日任务完成进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionRate}
        >
          <div
            className="today-v2-progress-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        <div className="today-v2-summary-caption">
          <span>{completedCount} / {totalCount} 已完成</span>
          <span>{activeCount > 0 ? `还剩 ${activeCount} 条待处理` : '今天的任务已经清空'}</span>
        </div>

        <div className="today-v2-summary-stats">
          <div>
            <span>总数</span>
            <strong>{totalCount}</strong>
          </div>
          <div>
            <span>待处理</span>
            <strong>{activeCount}</strong>
          </div>
          <div>
            <span>已完成</span>
            <strong>{completedCount}</strong>
          </div>
        </div>
      </section>

      <section className="panel today-v2-summary-card today-v2-summary-card-focus today-v2-reveal today-v2-reveal-delay-3">
        <p className="today-v2-card-kicker">今日核心任务</p>
        <h2 className="section-title">
          {coreTask ? coreTask.title : '先新增一条高优先级任务'}
        </h2>
        <div className="today-v2-focus-strip">
          <span className="today-v2-focus-pill">
            {coreTask ? '建议先处理' : '等待安排'}
          </span>
          <span className="today-v2-focus-pill today-v2-focus-pill-soft">
            {coreTask ? '减少切换成本' : '先把最重要的一件事写下来'}
          </span>
        </div>
        <p className="section-description">
          {coreTask
            ? '这是系统根据优先级、逾期情况和截止时间推荐的第一件事。'
            : '今天还没有核心任务。先安排一条最重要的事情，再开始推进。'}
        </p>
      </section>

      <section className="panel today-v2-summary-card today-v2-summary-card-sort today-v2-reveal today-v2-reveal-delay-4">
        <div className="today-v2-control-head">
          <div>
            <p className="today-v2-card-kicker">智能排序</p>
            <h2 className="section-title">当前排序方式</h2>
          </div>
          <span className="today-v2-selected-count">已选 {selectedCount}</span>
        </div>

        <div className="today-v2-sort-list" role="radiogroup" aria-label="排序方式">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`today-v2-sort-option ${
                sortValue === option.value ? 'today-v2-sort-option-active' : ''
              }`}
              type="button"
              role="radio"
              aria-checked={sortValue === option.value}
              onClick={() => onSortChange(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
        <p className="today-v2-summary-helper">
          推荐排序更适合开工前快速决定“先做什么”。
        </p>
      </section>

      <section className="panel today-v2-summary-card today-v2-summary-card-drop today-v2-reveal today-v2-reveal-delay-4">
        <p className="today-v2-card-kicker">拖拽调整优先级</p>
        <h2 className="section-title">把任务拖到目标优先级</h2>
        <p className="section-description">
          {draggingTaskTitle
            ? `正在拖动：${draggingTaskTitle}`
            : '也可以直接在任务卡片里点击高 / 中 / 低按钮调整。'}
        </p>

        <div className="today-v2-drop-grid">
          {TASK_PRIORITY_OPTIONS.map((priority) => (
            <button
              key={priority}
              className={`today-v2-drop-zone today-v2-drop-zone-${priority} ${
                activeDropPriority === priority ? 'today-v2-drop-zone-active' : ''
              }`}
              type="button"
              onDragOver={(event) => {
                event.preventDefault();
                onPriorityDragOver(priority);
              }}
              onDragLeave={onPriorityDragLeave}
              onDrop={(event) => {
                event.preventDefault();
                onPriorityDrop(priority);
              }}
            >
              <span>{TASK_PRIORITY_LABELS[priority]}优先级</span>
              <strong>{priorityCounts[priority]}</strong>
            </button>
          ))}
        </div>
        <p className="today-v2-summary-helper">
          想快速整理节奏时，把任务直接拖到对应区域会更顺手。
        </p>
      </section>
    </aside>
  );
}
