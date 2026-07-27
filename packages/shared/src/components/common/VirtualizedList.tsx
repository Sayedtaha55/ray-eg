import React, { useCallback, useRef } from 'react';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';

type RowRenderer<T> = (item: T, index: number, style: React.CSSProperties) => React.ReactNode;

export interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: RowRenderer<T>;
  height?: number | string;
  className?: string;
  innerClassName?: string;
  overscanCount?: number;
  /**
   * Threshold: only use virtualization when items.length >= threshold.
   * Falls back to a plain div render below this to avoid unnecessary overhead.
   */
  threshold?: number;
  /**
   * Optional: gap between items in pixels.
   */
  gap?: number;
  /**
   * Optional: stable key extractor.
   */
  getKey?: (item: T, index: number) => string | number;
  /**
   * Optional: load more handler. When provided, infinite scroll is enabled.
   */
  loadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  /**
   * Optional: aria label for the list region.
   */
  ariaLabel?: string;
  /**
   * Force plain rendering (skips virtualization even if above threshold).
   */
  forcePlain?: boolean;
}

interface RowWrapperProps<T> {
  items: T[];
  renderItem: RowRenderer<T>;
  gap?: number;
  loadMore?: () => void | Promise<void>;
  hasMore?: boolean;
}

const RowWrapper = <T,>({
  ariaAttributes,
  index,
  style,
  items,
  renderItem,
  gap,
  loadMore,
  hasMore,
}: {
  ariaAttributes: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  index: number;
  style: React.CSSProperties;
} & RowWrapperProps<T>) => {
  const item = items[index];
  if (!item) {
    if (loadMore && hasMore && index === items.length) {
      return (
        <div style={style} role="status" aria-live="polite">
          Loading...
        </div>
      );
    }
    return null;
  }

  const adjustedStyle: React.CSSProperties = {
    ...style,
    ...(gap ? { paddingBottom: gap } : {}),
  };

  return (
    <div style={adjustedStyle} {...ariaAttributes}>
      {renderItem(item, index, adjustedStyle)}
    </div>
  );
};

function VirtualizedList<T>(props: VirtualizedListProps<T>) {
  const {
    items,
    itemHeight,
    renderItem,
    height = 480,
    className = '',
    innerClassName = '',
    overscanCount = 4,
    threshold = 20,
    gap = 0,
    getKey,
    loadMore,
    hasMore,
    ariaLabel,
    forcePlain = false,
  } = props;

  const listRef = useRef<any>(null);
  const loadingRef = useRef(false);

  const handleRowsRendered = useCallback(
    (visibleRows: { startIndex: number; stopIndex: number }) => {
      if (!loadMore || !hasMore) return;
      if (loadingRef.current) return;

      const totalItems = items.length;
      if (visibleRows.stopIndex >= totalItems - 5) {
        loadingRef.current = true;
        Promise.resolve(loadMore())
          .catch(() => undefined)
          .finally(() => {
            loadingRef.current = false;
          });
      }
    },
    [loadMore, hasMore, items.length],
  );

  if (forcePlain || items.length < threshold) {
    return (
      <div className={className} role="list" aria-label={ariaLabel}>
        {items.map((item, idx) => (
          <div
            key={getKey ? getKey(item, idx) : idx}
            role="listitem"
            style={gap ? { marginBottom: gap } : undefined}
          >
            {renderItem(item, idx, {})}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className} aria-label={ariaLabel}>
      <AutoSizer
        renderProp={({ height: autoH, width }) => {
          const finalHeight = typeof height === 'number' ? height : (autoH ?? 480);
          const finalWidth = width ?? '100%';

          return (
            <List
              listRef={listRef}
              style={{ height: finalHeight, width: finalWidth }}
              rowCount={items.length + (loadMore && hasMore ? 1 : 0)}
              rowHeight={itemHeight}
              overscanCount={overscanCount}
              onRowsRendered={handleRowsRendered}
              className={innerClassName}
              rowComponent={RowWrapper as any}
              rowProps={{
                items,
                renderItem,
                gap,
                loadMore,
                hasMore,
              }}
            />
          );
        }}
      />
    </div>
  );
}

export default VirtualizedList;
