import type {
  CurrentCellInfoType,
  GameModeType,
} from "../../dataTypes/aboutUiType.ts";
import {
  getLocalSvgCoordinates,
  openModal,
  updateToNormalMode,
} from "../../utils.ts";
import { mapInteraction } from "./mapInteraction.ts";
import { worldMetadata } from "./worldMetadata.ts";
import type { FeatureClass } from "../../dataTypes/packCellsType.ts";
import {
  attackLevyInfoStored,
  isMyRealmId,
  myRealmPopulationStored,
  sectorRealmMapStored,
} from "../shared.svelte.ts";
import { sectorApi } from "./api/sector.ts";
import CreateRealm from "./components/modal/CreateRealm.svelte";
import Attack from "./components/modal/Attack.svelte";
import { indigenousUnitApi } from "./api/indigenous_unit.ts";
import { HttpStatusCode } from "axios";
import type { IndigenousUnitType } from "../../model/indigenous_unit.ts";

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

  // scale에 따라 transform-origin을 설정
  mapGroup.style.transformOrigin = `0px 0px`;

  // 트랜스폼 업데이트
  mapGroup.style.transform = `translate(${mapInteraction.translateX}px, ${mapInteraction.translateY}px) scale(${mapInteraction.scale})`;
}

export async function onClick(
  event: MouseEvent,
  map: SVGSVGElement | undefined,
  svgLayer: SVGSVGElement | undefined,
  updateCellInfoFn: (newInfo: CurrentCellInfoType) => void,
  latestCellInfo: CurrentCellInfoType | undefined,
  gameModeType: GameModeType,
) {
  if (!map || !svgLayer) {
    return;
  }

  switch (gameModeType) {
    case "NORMAL":
      await clickNormal(event, map, latestCellInfo, updateCellInfoFn);
      break;
    case "CELL_SELECTION":
      clickCellSection(event, map, svgLayer, latestCellInfo, updateCellInfoFn);
      break;
    case "ATTACK":
      clickAttack(event, map, svgLayer);
      break;
  }
}

function clickAttack(
  event: MouseEvent,
  map: SVGSVGElement,
  svgLayer: SVGSVGElement,
) {
  const { x, y } = getLocalSvgCoordinates(event, map);
  const targetSector = worldMetadata.findCell(x, y); // pack cell id

  if (!targetSector) {
    return;
  }
  if (!attackLevyInfoStored) {
    alert("공격 부대에 대한 정보가 없습니다.");
    return;
  }
  const isRealmSector = sectorRealmMapStored.has(targetSector);
  if (isRealmSector && isMyRealmId(sectorRealmMapStored.get(targetSector))) {
    return;
  }

  const nearLands = worldMetadata.pack!.cells.cells.c[
    attackLevyInfoStored.encampment
  ].filter((i) => {
    const feature = worldMetadata.pack!.cells.features[
      worldMetadata.pack!.cells.cells.f[i]
    ] as FeatureClass;
    return feature.land;
  });
  if (nearLands.find((cell) => cell === targetSector)) {
    openModal("출병", Attack, {
      levyId: attackLevyInfoStored.levyId,
      attackActionData: {
        originSector: attackLevyInfoStored.encampment,
        targetSector: targetSector,
      },
      svgLayer,
    });
  }
}

function clickCellSection(
  event: MouseEvent,
  map: SVGSVGElement,
  svgLayer: SVGSVGElement,
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
  if (
    provinceId &&
    latestCellInfo?.provinceId === provinceId &&
    !sectorRealmMapStored.has(i)
  ) {
    openModal("생성", CreateRealm, {
      currentCellInfo: latestCellInfo,
      updateCellInfoFn,
      svgLayer,
    });
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
    indigenousUnit: null,
  };
  updateCellInfoFn(newInfo);
  if (provinceId) {
    worldMetadata.drawProvinceCellsBorder(provinceId);
  }
}

async function clickNormal(
  event: MouseEvent,
  map: SVGSVGElement,
  latestCellInfo: CurrentCellInfoType | undefined,
  updateCellInfoFn: (newInfo: CurrentCellInfoType) => void,
) {
  const { x, y } = getLocalSvgCoordinates(event, map);
  const i = worldMetadata.findCell(x, y); // pack cell id
  if (!i) {
    return;
  }
  const feature = worldMetadata.pack!.cells.features[
    worldMetadata.pack!.cells.cells.f[i]
  ] as FeatureClass;
  const elevation = worldMetadata.pack!.cells.cells.h[i];
  const provinceId = worldMetadata.findProvince(i);

  const clickedRealmId = sectorRealmMapStored.get(i);

  let population = 0;
  let indigenousUnit: IndigenousUnitType | null = null;

  // 육지일 경우
  if (feature.land) {
    if (!clickedRealmId) {
      // 토착 군 세력 api 조회
      indigenousUnit = await getIndigenousUnit(i);
    }
    // stored 인구 조회
    if (myRealmPopulationStored.has(i)) {
      population = myRealmPopulationStored.get(i)!;
    } else {
      // call api or json 조회
      population = await getPopulation(i, clickedRealmId);
      myRealmPopulationStored.set(i, population);
    }
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
    indigenousUnit,
  };

  updateCellInfoFn(newInfo);

  // 이전과 다른 province를 클릭 or 처음 클릭
  if (!feature.land) {
    worldMetadata.removeOneCell();
    worldMetadata.removeSelectedSectors();
  } else if (provinceId && provinceId !== latestCellInfo?.provinceId) {
    worldMetadata.removeOneCell();
    worldMetadata.removeSelectedSectors();
    if (!sectorRealmMapStored.has(i)) {
      worldMetadata.fillSelectedSectors(
        worldMetadata.provinceCells.get(provinceId)!,
        "0xC8B4A0",
        "0x91835f",
      );
      worldMetadata.fillOneCell(i, "0x993800");
    }
  } else if (provinceId && latestCellInfo) {
    // 같은 province를 클릭
    worldMetadata.removeOneCell();
    if (!sectorRealmMapStored.has(i)) {
      worldMetadata.fillOneCell(i, "0x993800");
      // 이전 클릭이 주인있는 영토인경우 fill province
      if (sectorRealmMapStored.has(latestCellInfo.i)) {
        worldMetadata.fillSelectedSectors(
          worldMetadata.provinceCells.get(provinceId)!,
          "0xC8B4A0",
          "0x91835f",
        );
      }
    } else {
      worldMetadata.removeSelectedSectors();
    }
  }

  async function getPopulation(i: number, clickedRealmId: number | undefined) {
    // 점령된 영토일 경우
    if (clickedRealmId) {
      // 내 영토일 경우
      if (isMyRealmId(clickedRealmId)) {
        const res = await sectorApi.getPopulation({ cell_number: i });
        if (res.status === 200) {
          return res.data.population;
        }
        alert("인구 정보를 가져오는데 실패했습니다.");
        return 0;
      }
      return 0;
    }
    return worldMetadata.pack!.cells.cells.pop[i];
  }
  async function getIndigenousUnit(i: number) {
    const res = await indigenousUnitApi.getIndigenousUnit(i);
    switch (res.status) {
      case HttpStatusCode.Ok:
        return res.data.indigenous_unit;
      default:
        alert(res.data.api_response.description);
        return null;
    }
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
  gameModeType: GameModeType,
) {
  if (!map || !latestCellInfo || gameModeType !== "CELL_SELECTION") {
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
  if (sectorRealmMapStored.has(i)) {
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
    indigenousUnit: null,
  };
  if (feature.land && provinceId === latestCellInfo.provinceId) {
    if (i !== latestCellInfo.i && !sectorRealmMapStored.has(i)) {
      worldMetadata.removeOneCell();
      worldMetadata.fillOneCell(i, "0x993800");
      updateCellInfoFn(newInfo);
    }
  } else {
    worldMetadata.removeOneCell();
    worldMetadata.removeSelectedSectors();
  }
}

export function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case "Escape":
      updateToNormalMode();
      break;
  }
}
