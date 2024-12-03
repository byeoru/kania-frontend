import { mapController } from "./mapController";

export function onWheel(
  event: WheelEvent,
  mapContainer: HTMLDivElement,
  map: SVGSVGElement,
) {
  if (!mapContainer) {
    return;
  }

  event.preventDefault(); // 기본 스크롤 방지

  const containerRect = mapContainer.getBoundingClientRect();
  const containerCenterX = containerRect.width / 2;
  const containerCenterY = containerRect.height / 2;

  const mapRect = map.getBoundingClientRect();

  // scale에 따라 transform-origin을 설정
  map.style.transformOrigin = `0px 0px`;

  // 기존 좌표에 대한 스케일 적용
  const prevScale = mapController.scale;
  mapController.scale += event.deltaY * -0.01;
  mapController.scale = Math.min(
    Math.max(mapController.minScale, mapController.scale),
    3,
  ); // 스케일 제한

  // 경계 제한 계산
  const { elementDeltaMinX, elementDeltaMinY } =
    mapController.getElementMinDelta(containerRect, mapRect);
  const { elementDeltaMaxX, elementDeltaMaxY } =
    mapController.getElementMaxDelta(containerRect, mapRect);

  // 중심 기준 이동 계산
  const scaleFactor = mapController.scale / prevScale;
  mapController.translateX -=
    (containerCenterX - mapController.translateX) * (scaleFactor - 1);
  mapController.translateY -=
    (containerCenterY - mapController.translateY) * (scaleFactor - 1);

  // 경계 처리
  if (mapController.translateX > elementDeltaMinX) {
    mapController.translateX += elementDeltaMinX;
  }

  if (mapController.translateY > elementDeltaMinY) {
    mapController.translateY += elementDeltaMinY;
  }

  if (elementDeltaMaxX >= 0) {
    mapController.translateX += elementDeltaMaxX;
  }

  if (elementDeltaMaxY >= 0) {
    mapController.translateY += elementDeltaMaxY;
  }

  // 트랜스폼 업데이트
  map.style.transform = `translate(${mapController.translateX}px, ${mapController.translateY}px) scale(${mapController.scale})`;
}

export function onMouseDown(event: MouseEvent) {
  if (mapController.isDragging) {
    return;
  }
  mapController.isDragging = true;
  // 시작 위치 갱신
  mapController.updateStartXY(event);
}

export function onMouseMove(
  event: MouseEvent,
  mapContainer: HTMLDivElement,
  map: SVGSVGElement,
) {
  if (!mapContainer || !map || !mapController.isDragging) {
    return;
  }

  const containerRect = mapContainer.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();

  // 이동 거리 계산
  const { dragDeltaX, dragDeltaY } = mapController.getMouseDragDelta(event);

  // 경계 제한 계산
  const { elementDeltaMinX, elementDeltaMinY } =
    mapController.getElementMinDelta(containerRect, mapRect);
  const { elementDeltaMaxX, elementDeltaMaxY } =
    mapController.getElementMaxDelta(containerRect, mapRect);

  // mouse drag X, Y 수치 적용
  mapController.updateMapTranslate(
    dragDeltaX,
    dragDeltaY,
    elementDeltaMinX,
    elementDeltaMinY,
    elementDeltaMaxX,
    elementDeltaMaxY,
  );

  // 시작 위치 갱신
  mapController.updateStartXY(event);

  // 이동 적용
  map.style.transform = `translate(${mapController.translateX}px, ${mapController.translateY}px) scale(${mapController.scale})`;
}

export function onMouseUp(map: SVGSVGElement) {
  if (!map || !mapController.isDragging) {
    return;
  }
  mapController.isDragging = false;
}
