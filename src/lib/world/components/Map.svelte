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
  import { Application, Graphics } from "pixi.js";
  import type {
    ActionType,
    CurrentCellInfoType,
  } from "../../../dataTypes/aboutUiType";
  import { HttpStatusCode } from "axios";
  import {
    addMyRealmId,
    getMapInteractionMode,
    getMyRealmIdCount,
    initStandardRealTime,
    initStandardWorldTime,
    initWebSocketClient,
    ourRealmLevyActionsStored,
    realmInfoMapStored,
    sectorRealmMapStored,
    setMapInteractionMode,
    setMyRmId,
    storeCellLevies,
    storeLevyActions,
  } from "../../shared.svelte";
  import { select, xml } from "d3";
  import { realmMemberApi } from "../api/realm_member";

  let {
    mapContainer,
    mapNode = $bindable(),
    layerNode = $bindable(),
    mapGroup = $bindable(),
    currentCellInfo = $bindable(),
    updateCellInfoFn,
  }: {
    mapContainer: HTMLDivElement | undefined;
    mapNode: SVGSVGElement | undefined;
    layerNode: SVGSVGElement | undefined;
    mapGroup: HTMLDivElement | undefined;
    currentCellInfo: CurrentCellInfoType | undefined;
    updateCellInfoFn: (newInfo: CurrentCellInfoType) => void;
  } = $props();

  let mapLayerCanvas = $state<HTMLCanvasElement>();

  // map(svg) 조정, handler setting
  $effect(() => {
    if (!mapContainer || !mapNode) {
      return;
    }

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

  // map layer(svg, canvas) init
  $effect(() => {
    if (!mapContainer || !mapLayerCanvas || !layerNode) {
      return;
    }
    mapLayerInit(mapLayerCanvas, layerNode);
  });

  // map interaction mode(game mode) controll
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
          setMapInteractionMode("NORMAL");
          break;
        }
        worldMetadata.fillStrokeNearLandCells(currentCellInfo.i);
        break;
    }
  });

  const loadSVG = async (path: string) => {
    const res = await fetch(path);
    const svgContent = await res.text();
    return svgContent;
  };

  const GetContentsOfSVG = async () => {
    await worldMetadata.loadMetadata();
    worldMetadata.createQuadtree();

    const mapHtml = await loadSVG("assets/map/kania_.svg");
    const backgroundContents = getInsideTag(mapHtml, "svg");
    const layerContents = await loadSVG("assets/map/kania_layer.svg");
    return { backgroundContents, layerContents };
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

  async function callApiForDrawRealm(svgLayer: SVGSVGElement): Promise<number> {
    const res = await realmMemberApi.getMeAndTheOthersRealms();
    switch (res.status) {
      case HttpStatusCode.Ok:
        const capitalGroup = select(svgLayer).select("#capitals");
        if (!capitalGroup) {
          alert("올바르지 않은 svg입니다.");
          return 0;
        }
        const { standard_times, rm_id, my_realm, the_others_realms } = res.data;

        // 기준 시간 저장
        initStandardWorldTime(standard_times.standard_world_time);
        initStandardRealTime(standard_times.standard_real_time);

        // 다른 세력 sector info 저장
        the_others_realms.forEach((realm) => {
          realmInfoMapStored.set(realm.id, {
            id: realm.id,
            name: realm.name,
            owner_nickname: realm.owner_nickname,
            capitals: realm.capitals,
            political_entity: realm.political_entity,
            color: realm.color,
          });
          // 다른 세력 sector id 저장
          const sectors = realm.realm_cells_json.RawMessage;
          const values = Object.values(sectors);
          for (const sector of values) {
            sectorRealmMapStored.set(sector, realm.id);
          }

          // draw the others realms
          worldMetadata.realmGraphicsMap.set(realm.id, new Graphics());
          worldMetadata.realmCells.set(realm.id, new Set(values));

          worldMetadata.fillRealm(realm.id, values, `0x${realm.color}`);
          worldMetadata.drawCapitals(realm.capitals, realm.id, capitalGroup);
        });
        setMyRmId(rm_id);
        if (!my_realm) {
          setMapInteractionMode("CELL_SELECTION");
        } else {
          // 내 세력 정보 저장
          const {
            id: myRealmId,
            name: myRealmName,
            owner_nickname: myNickname,
            color: myColor,
            political_entity: myPoliticalEntity,
            capitals: myCapitals,
            realm_cells_json: { RawMessage: mySectors },
          } = my_realm;
          addMyRealmId(myRealmId);
          // 내 세력 sector info 저장
          realmInfoMapStored.set(myRealmId, {
            id: myRealmId,
            name: myRealmName,
            owner_nickname: myNickname,
            capitals: myCapitals,
            political_entity: myPoliticalEntity,
            color: myColor,
          });
          // 내 세력 sector id 저장
          const mySectorNumbers = Object.values(mySectors);
          for (const sector of mySectorNumbers) {
            sectorRealmMapStored.set(sector, myRealmId);
          }
          // draw my realm
          worldMetadata.realmGraphicsMap.set(myRealmId, new Graphics());
          worldMetadata.realmCells.set(myRealmId, new Set(mySectorNumbers));
          worldMetadata.fillRealm(myRealmId, mySectorNumbers, `0x${myColor}`);
          worldMetadata.drawCapitals(myCapitals, myRealmId, capitalGroup);
        }
    }
    return getMyRealmIdCount();
  }

  const drawActions = () => {
    const actions = ourRealmLevyActionsStored.values();
    actions.forEach((action) => {
      const type = action.action_type as ActionType;
      worldMetadata.drawActionRoad(
        action.levy_action_id,
        type,
        action.origin_sector,
        action.target_sector,
      );
      switch (type) {
        case "Attack":
          worldMetadata.drawAttackLogo(
            action.target_sector,
            action.levy_action_id,
          );
          break;
        case "Move":
          break;
        case "Return":
          worldMetadata.drawReturnLogo(
            action.origin_sector,
            action.levy_action_id,
          );
          break;
      }
    });
  };

  async function callApiForDrawLevies(svgLayer: SVGSVGElement) {
    const res = await realmMemberApi.getOurRealmLevies();
    switch (res.status) {
      case HttpStatusCode.Ok:
        const { realm_levies, levy_actions } = res.data;
        storeCellLevies(realm_levies);
        storeLevyActions(levy_actions);
        drawActions();

        break;
      case HttpStatusCode.NotFound:
        alert("소속된 국가가 존재하지 않습니다.");
        break;
    }
  }

  async function mapLayerInit(
    canvasLayer: HTMLCanvasElement,
    mapLayerSVG: SVGSVGElement,
  ) {
    await pixiInit(canvasLayer);
    // layer svg element init
    mapLayerSVGInit(mapLayerSVG);
    // data fetch and draw(svg, canvas)
    await mapLayerDataInit(mapLayerSVG);
    // ws 연결
    initWebSocketClient("ws://localhost:8081");
  }

  function mapLayerSVGInit(mapLayerSVG: SVGSVGElement) {
    /**
     * svg 요소 렌더링 순서 중요. 변경하지 말것
     */
    // layersvg에 defs 추가
    select(mapLayerSVG).append("defs");
    // layersvg에 unit advance road group 추가
    select(mapLayerSVG)
      .append("g")
      .attr("id", "unit_action_roads")
      .attr("stroke-dasharray", "3, 6")
      .attr("stroke-width", "3")
      .attr("stroke-linecap", "round"); // 끝을 둥글게
    // layersvg에 capital group 추가
    select(mapLayerSVG).append("g").attr("id", "capitals");
    // layersvg에 action logo group 추가
    select(mapLayerSVG).append("g").attr("id", "action_logos");

    // map defs에 levy action logo group defs 추가
    const actionLogoGroup = select(mapLayerSVG)
      .select("defs")
      .append("g")
      .attr("id", "action_logo_defs");

    xml("/assets/img/attack_logo.svg").then((data) => {
      const importedSVG = data.documentElement;
      actionLogoGroup.node()?.append(importedSVG);
    });
    xml("/assets/img/return_logo.svg").then((data) => {
      const importedSVG = data.documentElement;
      actionLogoGroup.node()?.append(importedSVG);
    });
  }

  async function mapLayerDataInit(svgLayer: SVGSVGElement) {
    const myRealmIdCount = await callApiForDrawRealm(svgLayer);
    if (myRealmIdCount > 0) {
      await callApiForDrawLevies(svgLayer);
    }
  }
</script>

{#await GetContentsOfSVG()}
  <Loading description="데이터를 불러오는 중입니다" />
{:then contents}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    id="map-group"
    bind:this={mapGroup}
    onclick={(event) =>
      onClick(
        event,
        mapNode,
        layerNode,
        updateCellInfoFn,
        currentCellInfo,
        getMapInteractionMode(),
      )}
    onmousemove={(event) =>
      onMouseMoveMetadata(
        event,
        mapNode,
        currentCellInfo,
        updateCellInfoFn,
        getMapInteractionMode(),
      )}
    onwheel={(event) => onWheel(event, mapContainer, mapGroup)}
    onmousedown={onMouseDown}
  >
    <svg
      id="map-layer-svg"
      bind:this={layerNode}
      width={worldMetadata.mapWidth}
      height={worldMetadata.mapHeight}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      {@html contents.layerContents}
    </svg>
    <canvas id="map-layer-canvas" bind:this={mapLayerCanvas}></canvas>
    <svg
      id="world-map"
      bind:this={mapNode}
      width={worldMetadata.mapWidth}
      height={worldMetadata.mapHeight}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      {@html contents.backgroundContents}
    </svg>
  </div>
{/await}

<style>
  #world-map {
    z-index: 1;
    position: absolute;
  }
  #map-group {
    width: 7680px;
    height: 4320px;
    z-index: 4;
  }
  #map-layer-svg {
    position: absolute;
    z-index: 3;
  }
  #map-layer-canvas {
    z-index: 2;
    position: absolute;
  }
</style>
