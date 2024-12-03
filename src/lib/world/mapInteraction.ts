export const mapInteraction = {
  minScale: 1, // 최소 배율
  scale: 1, // 확대/축소 배율
  translateY: 0, // Y축 이동
  translateX: 0, // X축 이동
  isDragging: false, // 드래그 중인지 여부
  startX: 0, // 드래그 시작 위치 (X)
  startY: 0, // 드래그 시작 위치 (Y)

  getElementMinDelta(element1: DOMRect, element2: DOMRect) {
    const elementDeltaMinX = element1.left - element2.left;
    const elementDeltaMinY = element1.top - element2.top;
    return { elementDeltaMinX, elementDeltaMinY };
  },
  getElementMaxDelta(element1: DOMRect, element2: DOMRect) {
    const elementDeltaMaxX = element1.right - element2.right;
    const elementDeltaMaxY = element1.bottom - element2.bottom;
    return { elementDeltaMaxX, elementDeltaMaxY };
  },
  getMouseDragDelta(event: MouseEvent) {
    const dragDeltaX = event.clientX - this.startX;
    const dragDeltaY = event.clientY - this.startY;
    return { dragDeltaX, dragDeltaY };
  },
  updateMapTranslate(
    dragDeltaX: number,
    dragDeltaY: number,
    elementDeltaMinX: number,
    elementDeltaMinY: number,
    elementDeltaMaxX: number,
    elementDeltaMaxY: number,
  ) {
    // X축 이동
    if (dragDeltaX > 0) {
      this.translateX += Math.min(dragDeltaX, elementDeltaMinX * this.scale);
    } else {
      this.translateX += Math.max(dragDeltaX, elementDeltaMaxX * this.scale);
    }

    // Y축 이동
    if (dragDeltaY > 0) {
      this.translateY += Math.min(dragDeltaY, elementDeltaMinY * this.scale);
    } else {
      this.translateY += Math.max(dragDeltaY, elementDeltaMaxY * this.scale);
    }
  },
  updateStartXY(event: MouseEvent) {
    this.startX = event.clientX;
    this.startY = event.clientY;
  },
};
