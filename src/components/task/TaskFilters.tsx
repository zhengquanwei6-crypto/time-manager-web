import type { TaskFilterValue } from '../../types/task';

interface TaskFiltersProps {
  value: TaskFilterValue;
  onChange: (value: TaskFilterValue) => void;
}

const filterOptions: Array<{ label: string; value: TaskFilterValue }> = [
  { label: '全部', value: 'all' },
  { label: '未完成', value: 'active' },
  { label: '已完成', value: 'completed' },
];

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <div className="filter-row">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          className={
            option.value === value
              ? 'button button-primary button-filter'
              : 'button button-secondary button-filter'
          }
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
