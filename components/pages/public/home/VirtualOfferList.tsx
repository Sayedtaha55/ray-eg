import React, { useEffect, useMemo, useRef, useState } from 'react';
import OfferCard from './OfferCard';
import { Offer } from '@/types';


interface VirtualOfferListProps {
  offers: Offer[];
  loadingMore: boolean;
  onSelectedItem: (item: any) => void;
  playSound: () => void;
}

const VirtualOfferList: React.FC<VirtualOfferListProps> = ({ 
  offers, 
  loadingMore, 
  onSelectedItem, 
  playSound 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0, scrollTop: 0 });

  // Determine number of columns based on window width
  const getColumnCount = (width: number) => {
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 2; // Mobile is 2 columns in the current grid
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setViewport((p) => ({ ...p, width: Math.max(0, Math.floor(rect.width)), height: Math.max(0, Math.floor(rect.height)) }));
    };

    updateSize();

    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => updateSize());
      ro.observe(el);
    } catch {
    }

    return () => {
      try {
        ro?.disconnect();
      } catch {
      }
    };
  }, []);

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.scrollTop;
    setViewport((p) => (p.scrollTop === top ? p : { ...p, scrollTop: top }));
  };

  const columnCount = getColumnCount(viewport.width);
  const rowCount = Math.ceil(offers.length / Math.max(1, columnCount));
  const rowHeight = viewport.width > 768 ? 550 : 350;
  const overscan = 2;

  const visibleRange = useMemo(() => {
    if (viewport.height <= 0) return { startRow: 0, endRow: Math.min(rowCount, 6) };
    const startRow = Math.max(0, Math.floor(viewport.scrollTop / rowHeight) - overscan);
    const visibleRows = Math.ceil(viewport.height / rowHeight) + overscan * 2;
    const endRow = Math.min(rowCount, startRow + visibleRows);
    return { startRow, endRow };
  }, [viewport.height, viewport.scrollTop, rowCount, rowHeight]);

  const topSpacer = visibleRange.startRow * rowHeight;
  const bottomSpacer = Math.max(0, (rowCount - visibleRange.endRow) * rowHeight);

  const Row = ({ index }: { index: number }) => {
    const startIndex = index * columnCount;
    const rowItems = offers.slice(startIndex, startIndex + columnCount);

    return (
      <div className="flex gap-3 md:gap-8 lg:gap-12 px-2" style={{ height: rowHeight }}>
        {rowItems.map((offer: Offer, i: number) => (
          <div key={offer.id} className="flex-1">
            <OfferCard
              offer={offer}
              idx={startIndex + i}
              navigate={(path: string) => window.location.hash = path} // Use hash or custom navigate
              setSelectedItem={onSelectedItem}
              playSound={playSound}
            />
          </div>
        ))}
        {/* Fill empty slots in the last row to maintain grid alignment */}
        {rowItems.length < columnCount && 
          Array.from({ length: columnCount - rowItems.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1" />
          ))
        }
      </div>
    );
  };

  return (
    <div ref={containerRef} className="h-[800px] w-full overflow-auto" onScroll={onScroll}>
      <div style={{ height: topSpacer }} />
      <div className="space-y-3 md:space-y-8">
        {Array.from({ length: Math.max(0, visibleRange.endRow - visibleRange.startRow) }).map((_, i) => (
          <Row key={visibleRange.startRow + i} index={visibleRange.startRow + i} />
        ))}
      </div>
      <div style={{ height: bottomSpacer }} />
      {loadingMore ? (
        <div className="py-6 text-center text-slate-400 font-bold">جاري التحميل...</div>
      ) : null}
    </div>
  );
};

export default React.memo(VirtualOfferList);
