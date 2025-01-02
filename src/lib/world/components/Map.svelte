<script lang="ts">
  import { worldMetadata } from "../worldMetadata";
  import {
    onClick,
    onMouseDown,
    onMouseMoveMetadata,
    onWheel,
  } from "../eventHandler";
  import { mapInteraction } from "../mapInteraction";
  import Loading from "../../Loading.svelte";
  import { realmApi } from "../api/realm";
  import { Application } from "pixi.js";
  import type { CurrentCellInfoType } from "../../../dataTypes/aboutUiType";
  import { HttpStatusCode } from "axios";
  import {
    getMapInteractionMode,
    myRealmIdStored,
    myRealmLeviesStored,
    realmInfoMapStored,
    sectorRealmMapStored,
    setMapInteractionMode,
    storeCellLevies,
  } from "../../shared.svelte";
  import { select, xml, type BaseType, type Selection } from "d3";
  import { realmMemberApi } from "../api/realm_member";

  let {
    mapContainer,
    mapNode = $bindable(),
    mapGroup = $bindable(),
    currentCellInfo = $bindable(),
  }: {
    mapContainer: HTMLDivElement | undefined;
    mapNode: SVGSVGElement | undefined;
    mapGroup: HTMLDivElement | undefined;
    currentCellInfo: CurrentCellInfoType | undefined;
  } = $props();

  let mapLayer = $state<HTMLCanvasElement>();

  // map(svg) 조정, handler setting
  $effect(() => {
    if (!mapContainer || !mapNode) {
      return;
    }

    // map에 capital group 추가
    select(mapNode).append("g").attr("id", "capitals");
    // map에 unit flag group 추가
    select(mapNode).append("g").attr("id", "unit_flags");

    // map defs에 unit flag group defs 추가
    const unitFlagsGroup = select(mapNode)
      .select("defs")
      .append("g")
      .attr("id", "unit_flags_defs");

    xml("/assets/img/defense_ribbon_h.svg").then((data) => {
      const importedSVG = data.documentElement;
      unitFlagsGroup.node()?.append(importedSVG);
    });

    worldMetadata.prepareCellsBorder();

    // 초기 map scale value setting
    const containerRect = mapContainer.getBoundingClientRect();
    const mapRect = mapNode.getBoundingClientRect();

    const { elementDeltaMaxX, elementDeltaMaxY } =
      mapInteraction.getElementMaxDelta(containerRect, mapRect);

    // map이 container 보다 작을 경우
    if (elementDeltaMaxX > 0 || elementDeltaMaxY > 0) {
      // 새로 조정할 스케일 계산 (너비와 높이를 각각 비교)
      const widthScale = containerRect.width / mapRect.width;
      const heightScale = containerRect.height / mapRect.height;

      // 최종 스케일로 업데이트 (너비와 높이 중 큰 쪽을 선택) + 여유 scale 추가
      mapInteraction.minScale = Math.max(widthScale, heightScale) + 0.05;
      mapInteraction.scale = mapInteraction.minScale;

      // 배율 적용
      mapNode.style.transform = `scale(${mapInteraction.minScale})`;
    }
  });

  // map layer(canvas) init
  $effect(() => {
    if (!mapLayer) return;
    mapLayerInit(mapLayer);
  });

  $effect(() => {
    switch (getMapInteractionMode()) {
      case "NORMAL":
        worldMetadata.removeProvinceCells();
        worldMetadata.removeSelectedSectors();
        worldMetadata.removeOneCell();
        break;
      case "CELL_SELECTION":
        break;
      case "ATTACK":
        worldMetadata.removeProvinceCells();
        worldMetadata.removeSelectedSectors();
        worldMetadata.removeOneCell();
        if (!currentCellInfo) {
          alert("지역 데이터가 없습니다.");
          break;
        }
        worldMetadata.fillStrokeNearCells(currentCellInfo.i);
        break;
    }
  });

  const updateCurrentCellInfo = (newInfo: CurrentCellInfoType) => {
    currentCellInfo = newInfo;
  };

  const loadMap = async (path: string) => {
    const res = await fetch(path);
    const svgContent = await res.text();
    return svgContent;
  };

  const mapInit = async () => {
    await worldMetadata.loadMetadata();
    worldMetadata.createQuadtree();

    const mapHtml = await loadMap("assets/map/kania_.svg");
    const svgContents = getInsideTag(mapHtml, "svg");
    return svgContents;
  };

  function getInsideTag(html: string, tagName: string) {
    const startTagRegex = new RegExp(`<${tagName}([^>]*)>`);
    const endTag = `</${tagName}>`;

    const startMatch = startTagRegex.exec(html);
    const endIndex = html.lastIndexOf(endTag);

    if (!startMatch || endIndex === -1) {
      // 태그가 없으면 그대로 반환
      return html;
    }

    const startIndex = startMatch.index;

    return html.slice(startIndex + startMatch[0].length, endIndex);
  }

  async function pixiInit(canvas: HTMLCanvasElement) {
    const view = canvas.transferControlToOffscreen();
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({
      canvas: view,
      width: worldMetadata.mapWidth,
      height: worldMetadata.mapHeight,
      antialias: true, // 안티에일리어싱 활성화
      backgroundAlpha: 0,
    });
    worldMetadata.mapLayerStage = app.stage;
  }

  async function callApiForDrawRealm() {
    const res = await realmApi.getMeAndTheOthersRealms();
    switch (res.status) {
      case HttpStatusCode.Ok:
        const capitalGroup = select(mapNode!).select("#capitals");
        if (!capitalGroup) {
          alert("올바르지 않은 svg입니다.");
          return;
        }
        const {
          my_realm: {
            id: myRealmId,
            name: myRealmName,
            owner_nickname: myNickname,
            color: myColor,
            political_entity: myPoliticalEntity,
            capital_number: myCapitalNumber,
            realm_cells_json: {
              RawMessage: { cells: myCells },
            },
          },
          the_others_realms,
        } = res.data;
        $myRealmIdStored = myRealmId;
        // 내 세력 sector info 저장
        realmInfoMapStored.set(myRealmId, {
          id: myRealmId,
          name: myRealmName,
          owner_nickname: myNickname,
          capital_number: myCapitalNumber,
          political_entity: myPoliticalEntity,
          color: myColor,
        });
        // 내 세력 sector id 저장
        myCells.forEach((cellId) => {
          sectorRealmMapStored.set(cellId, myRealmId);
        });
        // 다른 세력 sector info 저장
        the_others_realms.map((realm) => {
          realmInfoMapStored.set(realm.id, {
            id: realm.id,
            name: realm.name,
            owner_nickname: realm.owner_nickname,
            capital_number: realm.capital_number,
            political_entity: realm.political_entity,
            color: realm.color,
          });
          // 다른 세력 sector id 저장
          realm.realm_cells_json.RawMessage.cells.forEach((cellId) => {
            sectorRealmMapStored.set(cellId, realm.id);
          });
        });
        // draw my realm
        worldMetadata.fillRealm(myCells, `0x${myColor}`);
        worldMetadata.drawCapital(myCapitalNumber, myRealmId, capitalGroup);
        // draw the others realms
        the_others_realms.forEach((realm) => {
          worldMetadata.fillRealm(
            realm.realm_cells_json.RawMessage.cells,
            `0x${realm.color}`,
          );
          worldMetadata.drawCapital(
            realm.capital_number,
            realm.id,
            capitalGroup,
          );
        });
        break;
      case HttpStatusCode.NoContent:
        setMapInteractionMode("CELL_SELECTION");
        break;
    }
  }

  function drawLevies(
    unitFlagsGroup: Selection<BaseType, unknown, null, undefined>,
  ) {
    const cellNumbers = myRealmLeviesStored.keys();
    for (const cellNumber of cellNumbers) {
      worldMetadata.drawDefenseUnitFlag(cellNumber, unitFlagsGroup);
    }
  }

  async function callApiForDrawLevies() {
    const res = await realmMemberApi.getRealmMembersLevies();
    switch (res.status) {
      case HttpStatusCode.Ok:
        const unitFlagsGroup = select(mapNode!).select("#unit_flags");
        const { realm_members } = res.data;
        storeCellLevies(realm_members);
        drawLevies(unitFlagsGroup);
        break;
      case HttpStatusCode.NotFound:
        alert("소속된 국가가 존재하지 않습니다.");
        break;
    }
  }

  async function mapLayerInit(canvas: HTMLCanvasElement) {
    await pixiInit(canvas);
    await callApiForDrawRealm();
    await callApiForDrawLevies();
  }
</script>

{#await mapInit()}
  <Loading description="데이터를 불러오는 중입니다" />
{:then mapContents}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    id="map-group"
    bind:this={mapGroup}
    onclick={(event) =>
      onClick(
        event,
        mapNode,
        $myRealmIdStored,
        updateCurrentCellInfo,
        currentCellInfo,
        getMapInteractionMode(),
      )}
    onmousemove={(event) =>
      onMouseMoveMetadata(
        event,
        mapNode,
        currentCellInfo,
        updateCurrentCellInfo,
        getMapInteractionMode(),
      )}
    onwheel={(event) => onWheel(event, mapContainer, mapGroup)}
    onmousedown={onMouseDown}
  >
    <canvas id="map-layer" bind:this={mapLayer}></canvas>
    <svg
      id="world-map"
      bind:this={mapNode}
      width={worldMetadata.mapWidth}
      height={worldMetadata.mapHeight}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      {@html mapContents}
    </svg>
  </div>
{/await}

<style>
  #world-map {
    position: absolute;
    z-index: 1;
  }
  #map-group {
    width: 7680px;
    height: 4320px;
    z-index: 3;
  }
  #map-layer {
    z-index: 2;
    position: absolute;
  }
</style>
