export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  bufferSize?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
}

export function calculateVirtualScroll(
  scrollTop: number,
  { itemHeight, containerHeight, bufferSize = 5 }: VirtualScrollOptions
): VirtualScrollResult {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize;
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY };
}

export function useVirtualScroll(
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number,
  bufferSize?: number
) {
  const { startIndex, endIndex, offsetY } = calculateVirtualScroll(scrollTop, {
    itemHeight,
    containerHeight,
    bufferSize,
  });

  return {
    startIndex,
    endIndex: Math.min(endIndex, totalItems),
    offsetY,
    visibleItems: Math.min(endIndex, totalItems) - startIndex,
  };
}
