import type {
  CurrentCellInfoType,
  MapInteractionType,
} from "../../dataTypes/aboutUiType";
import { getLocalSvgCoordinates } from "../../utils";
import { mapInteraction } from "./mapInteraction";
import { worldMetadata } from "./worldMetadata";
import type { FeatureClass } from "../../dataTypes/packCellsType";
import { realmsStored, showModal } from "../shared";

export function onWheel(
  event: WheelEvent,
  mapContainer: HTMLDivElement | undefined,
  mapGroup: HTMLDivElement | undefined,
) {
  if (!mapContainer || !mapGroup) {
    return;
  }

  event.preventDefault(); // 기본 스크롤 방지

  const containerRect = mapContainer.getBoundingClientRect();
  const containerCenterX = containerRect.width / 2;
  const containerCenterY = containerRect.height / 2;

  const mapRect = mapGroup.getBoundingClientRect();

  // scale에 따라 transform-origin을 설정
  mapGroup.style.transformOrigin = `0px 0px`;

  // 기존 좌표에 대한 스케일 적용
  const prevScale = mapInteraction.scale;
  mapInteraction.scale += event.deltaY * -0.01;
  mapInteraction.scale = Math.min(
    Math.max(mapInteraction.minScale, mapInteraction.scale),
    mapInteraction.maxScale,
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
  mapGroup.style.transform = `translate(${mapInteraction.translateX}px, ${mapInteraction.translateY}px) scale(${mapInteraction.scale})`;
}

export function onClick(
  event: MouseEvent,
  map: SVGSVGElement | undefined,
  updateCellInfoFn: (newInfo: CurrentCellInfoType) => void,
  latestCellInfo: CurrentCellInfoType | undefined,
  mapInteraction: MapInteractionType,
) {
  if (!map) {
    return;
  }

  switch (mapInteraction) {
    case "NORMAL":
      clickNormal(event, map, updateCellInfoFn);
      break;
    case "CELL_SELECTION":
      clickCellSection(event, map, latestCellInfo, updateCellInfoFn);
      break;
  }
}

function clickCellSection(
  event: MouseEvent,
  map: SVGSVGElement,
  latestCellInfo: CurrentCellInfoType | undefined,
  updateCellInfoFn: (newInfo: CurrentCellInfoType) => void,
) {
  worldMetadata.removeProvinceCells();
  const { x, y } = getLocalSvgCoordinates(event, map);
  const i = worldMetadata.findCell(x, y); // pack cell id
  if (!i) {
    return;
  }
  const feature = worldMetadata.pack!.cells.features[
    worldMetadata.pack!.cells.cells.f[i]
  ] as FeatureClass;
  const population = worldMetadata.pack!.cells.cells.pop[i];
  const elevation = worldMetadata.pack!.cells.cells.h[i];
  const provinceId = worldMetadata.findProvince(i);
  if (provinceId && latestCellInfo?.provinceId === provinceId) {
    showModal.set(true);
  }
  const newInfo: CurrentCellInfoType = {
    x,
    y,
    i,
    provinceId: provinceId,
    type: feature.type,
    population,
    elevation,
    biome: "",
    countryName: "",
    nickname: "",
    political_entity: "",
  };
  updateCellInfoFn(newInfo);
  if (provinceId) {
    worldMetadata.drawProvinceCellsBorder(provinceId);
  }
}

function clickNormal(
  event: MouseEvent,
  map: SVGSVGElement,
  updateCellInfoFn: (newInfo: CurrentCellInfoType) => void,
) {
  worldMetadata.removeSelectedSectors();
  worldMetadata.removeOneCell();
  const { x, y } = getLocalSvgCoordinates(event, map);
  const i = worldMetadata.findCell(x, y); // pack cell id
  if (!i) {
    return;
  }
  const feature = worldMetadata.pack!.cells.features[
    worldMetadata.pack!.cells.cells.f[i]
  ] as FeatureClass;
  const population = worldMetadata.pack!.cells.cells.pop[i];
  const elevation = worldMetadata.pack!.cells.cells.h[i];
  const provinceId = worldMetadata.findProvince(i);

  const realmId = realmsStored.sectorRealmMap.get(i);
  const realmInfo = realmId ? realmsStored.realmInfoMap.get(realmId) : null;

  const newInfo: CurrentCellInfoType = {
    x,
    y,
    i,
    provinceId: provinceId,
    type: feature.type,
    population,
    elevation,
    biome: "",
    countryName: realmInfo?.name,
    nickname: realmInfo?.owner_nickname ?? "없음",
    political_entity: realmInfo?.political_entity ?? "없음",
  };
  updateCellInfoFn(newInfo);
  if (provinceId && !realmsStored.sectorRealmMap.has(i)) {
    worldMetadata.fillSelectedSectors(
      worldMetadata.provinceCells[provinceId],
      "0xC8B4A0",
      "0x8C8C8C",
    );
    worldMetadata.fillOneCell(i, "0x993800");
  }
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
  mapContainer: HTMLDivElement | undefined,
  mapGroup: HTMLDivElement | undefined,
) {
  if (!mapContainer || !mapGroup || !mapInteraction.isDragging) {
    return;
  }

  const containerRect = mapContainer.getBoundingClientRect();
  const mapRect = mapGroup.getBoundingClientRect();

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
  mapGroup.style.transform = `translate(${mapInteraction.translateX}px, ${mapInteraction.translateY}px) scale(${mapInteraction.scale})`;
}

export function onMouseUp(map: SVGSVGElement | undefined) {
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
  map: SVGSVGElement | undefined,
  latestCellInfo: CurrentCellInfoType | undefined,
  updateCellInfoFn: (newInfo: CurrentCellInfoType) => void,
  mapInteractionMode: MapInteractionType,
) {
  if (!map || !latestCellInfo || mapInteractionMode !== "CELL_SELECTION") {
    return;
  }

  const { x, y } = getLocalSvgCoordinates(event, map);
  const i = worldMetadata.findCell(x, y); // pack cell id
  if (!i) {
    return;
  }
  const feature = worldMetadata.pack?.cells.features[
    worldMetadata.pack.cells.cells.f[i]
  ] as FeatureClass;
  const provinceId = worldMetadata.findProvince(i) ?? null;
  const population = worldMetadata.pack!.cells.cells.pop[i];
  const elevation = worldMetadata.pack!.cells.cells.h[i];
  if (realmsStored.sectorRealmMap.has(i)) {
  }
  const newInfo: CurrentCellInfoType = {
    x,
    y,
    i,
    provinceId: latestCellInfo.provinceId,
    type: feature.type,
    population,
    elevation,
    biome: "",
    countryName: "",
    nickname: "",
    political_entity: "",
  };
  if (feature.land && provinceId === latestCellInfo.provinceId) {
    if (i !== latestCellInfo.i) {
      worldMetadata.removeOneCell();
      worldMetadata.fillOneCell(i, "0x993800");
    }
  } else {
    worldMetadata.removeOneCell();
  }
  updateCellInfoFn(newInfo);
}
