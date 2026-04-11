import type { TaskFilterValue } from '../../types/task';

interface TodayFilterTabsProps {
  value: TaskFilterValue;
  onChange: (value: TaskFilterValue) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

const filterItems: Array<{ value: TaskFilterValue; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '待处理' },
  { value: 'completed', label: '已完成' },
];

export function TodayFilterTabs({
  value,
  onChange,
  counts,
}: TodayFilterTabsProps) {
  return (
    <div className="today-filter-tabs" role="tablist" aria-label="今日任务筛选">
      {filterItems.map((item) => (
        <button
          key={item.value}
          id={`today-tab-${item.value}`}
          className={`today-filter-tab ${
            item.value === value ? 'today-filter-tab-active' : ''
          }`}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          aria-controls="today-task-board"
          onClick={() => onChange(item.value)}
        >
          <span>{item.label}</span>
          <strong>{counts[item.value]}</strong>
        </button>
      ))}
    </div>
  );
}
