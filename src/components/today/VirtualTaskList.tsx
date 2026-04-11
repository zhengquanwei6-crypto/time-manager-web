import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

interface VirtualTaskListProps<T> {
  items: T[];
  ariaLabel: string;
  estimatedRowHeight?: number;
  height?: number;
  overscan?: number;
  getItemKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
}

export function VirtualTaskList<T>({
  items,
  ariaLabel,
  estimatedRowHeight = 208,
  height = 620,
  overscan = 4,
  getItemKey,
  renderItem,
}: VirtualTaskListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const shouldVirtualize = items.length > 8;

  const visibleRange = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
      };
    }

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / estimatedRowHeight) - overscan,
    );
    const visibleCount = Math.ceil(height / estimatedRowHeight) + overscan * 2;
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount - 1);

    return {
      startIndex,
      endIndex,
    };
  }, [estimatedRowHeight, height, items.length, overscan, scrollTop, shouldVirtualize]);

  if (!shouldVirtualize) {
    return (
      <div className="today-v2-task-list" role="list" aria-label={ariaLabel}>
        {items.map((item, index) => (
          <div key={getItemKey(item)}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  const totalHeight = items.length * estimatedRowHeight;
  const visibleItems = items.slice(
    visibleRange.startIndex,
    visibleRange.endIndex + 1,
  );

  return (
    <div className="today-v2-virtual-shell">
      <div
        className="today-v2-virtual-scroll"
        style={{ height }}
        role="list"
        aria-label={ariaLabel}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <div className="today-v2-virtual-inner" style={{ height: totalHeight }}>
          {visibleItems.map((item, offset) => {
            const index = visibleRange.startIndex + offset;

            return (
              <div
                key={getItemKey(item)}
                className="today-v2-virtual-item"
                style={{ top: index * estimatedRowHeight }}
              >
                {renderItem(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
