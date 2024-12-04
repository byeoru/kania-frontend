import { pack } from "d3";
import type { CurrentCellInfoType } from "../../dataTypes/currentCellInfoType";
import { getLocalSvgCoordinates } from "../../utils";
import { mapInteraction } from "./mapInteraction";
import { worldMetadata } from "./worldMetadata";
import type { FeatureClass } from "../../dataTypes/packCellsType";

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
  const prevScale = mapInteraction.scale;
  mapInteraction.scale += event.deltaY * -0.01;
  mapInteraction.scale = Math.min(
    Math.max(mapInteraction.minScale, mapInteraction.scale),
    3,
  ); // 스케일 제한

  // 경계 제한 계산
  const { elementDeltaMinX, elementDeltaMinY } =
    mapInteraction.getElementMinDelta(containerRect, mapRect);
  const { elementDeltaMaxX, elementDeltaMaxY } =
    mapInteraction.getElementMaxDelta(containerRect, mapRect);

  // 중심 기준 이동 계산
  const scaleFactor = mapInteraction.scale / prevScale;
  mapInteraction.translateX -=
    (containerCenterX - mapInteraction.translateX) * (scaleFactor - 1);
  mapInteraction.translateY -=
    (containerCenterY - mapInteraction.translateY) * (scaleFactor - 1);

  // 경계 처리
  if (mapInteraction.translateX > elementDeltaMinX) {
    mapInteraction.translateX += elementDeltaMinX;
  }

  if (mapInteraction.translateY > elementDeltaMinY) {
    mapInteraction.translateY += elementDeltaMinY;
  }

  if (elementDeltaMaxX >= 0) {
    mapInteraction.translateX += elementDeltaMaxX;
  }

  if (elementDeltaMaxY >= 0) {
    mapInteraction.translateY += elementDeltaMaxY;
  }

  // 트랜스폼 업데이트
  map.style.transform = `translate(${mapInteraction.translateX}px, ${mapInteraction.translateY}px) scale(${mapInteraction.scale})`;
}

export function onMouseDown(event: MouseEvent) {
  if (mapInteraction.isDragging) {
    return;
  }
  mapInteraction.isDragging = true;
  // 시작 위치 갱신
  mapInteraction.updateStartXY(event);
}

export function onMouseMove(
  event: MouseEvent,
  mapContainer: HTMLDivElement,
  map: SVGSVGElement,
) {
  if (!mapContainer || !map || !mapInteraction.isDragging) {
    return;
  }

  const containerRect = mapContainer.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();

  // 이동 거리 계산
  const { dragDeltaX, dragDeltaY } = mapInteraction.getMouseDragDelta(event);

  // 경계 제한 계산
  const { elementDeltaMinX, elementDeltaMinY } =
    mapInteraction.getElementMinDelta(containerRect, mapRect);
  const { elementDeltaMaxX, elementDeltaMaxY } =
    mapInteraction.getElementMaxDelta(containerRect, mapRect);

  // mouse drag X, Y 수치 적용
  mapInteraction.updateMapTranslate(
    dragDeltaX,
    dragDeltaY,
    elementDeltaMinX,
    elementDeltaMinY,
    elementDeltaMaxX,
    elementDeltaMaxY,
  );

  // 시작 위치 갱신
  mapInteraction.updateStartXY(event);

  // 이동 적용
  map.style.transform = `translate(${mapInteraction.translateX}px, ${mapInteraction.translateY}px) scale(${mapInteraction.scale})`;
}

export function onMouseUp(map: SVGSVGElement) {
  if (!map || !mapInteraction.isDragging) {
    return;
  }
  mapInteraction.isDragging = false;
}

export function onMouseLeave() {
  mapInteraction.isDragging = false;
}

export function onMouseMoveMetadata(
  event: MouseEvent,
  map: SVGSVGElement,
  updateCellInfoFn: (newInfo: CurrentCellInfoType) => void,
) {
  const { x, y } = getLocalSvgCoordinates(event, map);
  const i = worldMetadata.findCell(x, y); // pack cell id
  if (!i) {
    return;
  }
  const feature = worldMetadata.pack?.cells.features[
    worldMetadata.pack.cells.cells.f[i]
  ] as FeatureClass;
  const newInfo: CurrentCellInfoType = {
    x,
    y,
    i,
    type: feature.type,
  };
  updateCellInfoFn(newInfo);
}
