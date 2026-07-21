import { useEffect, useRef, useState } from 'react';

interface UseTableScrollSyncReturn {
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  headerWrapperRef: React.RefObject<HTMLDivElement | null>;
  rowWrapperRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  stickyScrollRef: React.RefObject<HTMLDivElement | null>;
  stickyInnerRef: React.RefObject<HTMLDivElement | null>;
  headerHeight: number;
  sync: (source: HTMLDivElement) => void;
}

/**
 * Synchronises horizontal scroll across a fixed header, multiple row wrappers
 * and a sticky bottom scrollbar. Also computes the header height so sticky
 * plan-group rows can be positioned below it.
 *
 * @param resetScrollDep - when this value changes, all scroll positions reset to 0
 */
export const useTableScrollSync = (
  resetScrollDep?: unknown
): UseTableScrollSyncReturn => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const syncingRef = useRef(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const rowWrapperRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);

  const sync = (source: HTMLDivElement) => {
    if (syncingRef.current) {
      return;
    }
    syncingRef.current = true;
    [
      headerWrapperRef.current,
      ...Array.from(rowWrapperRefs.current.values()),
      stickyScrollRef.current
    ]
      .filter((el): el is HTMLDivElement => !!el && el !== source)
      .forEach((el) => {
        el.scrollLeft = source.scrollLeft;
      });
    syncingRef.current = false;
  };

  useEffect(() => {
    if (headerWrapperRef.current) {
      headerWrapperRef.current.scrollLeft = 0;
    }
    if (stickyScrollRef.current) {
      stickyScrollRef.current.scrollLeft = 0;
    }
    rowWrapperRefs.current.forEach((el) => {
      el.scrollLeft = 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetScrollDep]);

  useEffect(() => {
    const header = headerWrapperRef.current;
    const sticky = stickyScrollRef.current;
    const inner = stickyInnerRef.current;
    if (!header || !sticky || !inner) {
      return;
    }

    const updateWidth = () => {
      inner.style.width = `${header.scrollWidth}px`;
      setHeaderHeight(header.offsetHeight);
    };
    const ro = new ResizeObserver(updateWidth);
    ro.observe(header);
    const tableEl = header.querySelector('table');
    if (tableEl) {
      ro.observe(tableEl);
    }
    updateWidth();

    const onHeaderScroll = () => sync(header);
    const onStickyScroll = () => sync(sticky);
    header.addEventListener('scroll', onHeaderScroll, { passive: true });
    sticky.addEventListener('scroll', onStickyScroll);

    const tableContainer = tableContainerRef.current;
    const onWheel = (e: WheelEvent) => {
      if (sticky.contains(e.target as Node)) {
        return;
      }
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
        return;
      }
      e.preventDefault();
      let delta = e.deltaX;
      if (e.deltaMode === 1) delta *= 24;
      if (e.deltaMode === 2) delta *= sticky.clientWidth;
      sticky.scrollLeft += delta;
    };
    tableContainer?.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      ro.disconnect();
      header.removeEventListener('scroll', onHeaderScroll);
      sticky.removeEventListener('scroll', onStickyScroll);
      tableContainer?.removeEventListener('wheel', onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tableContainerRef,
    headerWrapperRef,
    rowWrapperRefs,
    stickyScrollRef,
    stickyInnerRef,
    headerHeight,
    sync
  };
};
