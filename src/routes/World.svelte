<script lang="ts">
  import type { CurrentCellInfoType } from "../dataTypes/currentCellInfoType";
  import Loading from "../lib/Loading.svelte";
  import MyInfo from "../lib/world/components/MyInfo.svelte";
  import RegionInfo from "../lib/world/components/RegionInfo.svelte";
  import {
    onMouseDown,
    onMouseLeave,
    onMouseMove,
    onMouseMoveMetadata,
    onMouseUp,
    onWheel,
  } from "../lib/world/eventHandler";
  import { mapInteraction } from "../lib/world/mapInteraction";
  import { worldMetadata } from "../lib/world/worldMetadata";
  import { select } from "d3";

  let mapContainer: HTMLDivElement | null = $state(null);
  let mapElement: SVGSVGElement;
  let currentCellInfo = $state<CurrentCellInfoType>();

  $effect(() => {
    const mapNode = mapContainer?.querySelector("svg");
    if (!mapNode) {
      return;
    }

    const svgViewbox = select("#fantasyMap").select("#viewbox");
    const cellsLayer = svgViewbox
      .append("g")
      .attr("id", "cells")
      .attr("stroke", "#808080")
      .attr("stroke-width", 0.007)
      .style("fill", "none");

    // prepare cells border data
    worldMetadata.prepareCellsBorder();

    mapElement = mapNode;
    mapElement.addEventListener("mousedown", onMouseDown);
    mapElement.addEventListener("wheel", (event) =>
      onWheel(event, mapContainer!, mapElement, cellsLayer),
    );

    // 초기 map scale value setting
    const containerRect = mapContainer!.getBoundingClientRect();
    const mapRect = mapElement.getBoundingClientRect();

    const { elementDeltaMaxX, elementDeltaMaxY } =
      mapInteraction.getElementMaxDelta(containerRect, mapRect);

    // map이 container 보다 클 경우
    if (elementDeltaMaxX > 0 || elementDeltaMaxY > 0) {
      // 새로 조정할 스케일 계산 (너비와 높이를 각각 비교)
      const widthScale = containerRect.width / mapRect.width;
      const heightScale = containerRect.height / mapRect.height;

      // 최종 스케일로 업데이트 (너비와 높이 중 큰 쪽을 선택) + 여유 scale 추가
      mapInteraction.minScale = Math.max(widthScale, heightScale) + 0.05;
      mapInteraction.scale = mapInteraction.minScale;

      // 배율 적용
      mapElement.style.transform = `scale(${mapInteraction.minScale})`;
    }

    return () => {
      mapElement.removeEventListener("mousedown", onMouseDown);
      mapElement.removeEventListener("wheel", (event) =>
        onWheel(event, mapContainer!, mapElement, cellsLayer),
      );
    };
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

    return loadMap("/src/assets/map/kania.svg");
  };
</script>

{#await mapInit()}
  <Loading description="데이터를 불러오는 중입니다" />
{:then map}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="hole_screen"
    onmousemove={(event) => onMouseMove(event, mapContainer!, mapElement)}
    onmouseup={() => onMouseUp(mapElement)}
    onmouseleave={onMouseLeave}
  >
    <MyInfo cellInfo={currentCellInfo} />
    <div
      class="map_container"
      bind:this={mapContainer}
      onmousemove={(event) =>
        onMouseMoveMetadata(event, mapElement, updateCurrentCellInfo)}
    >
      {@html map}
    </div>
    <RegionInfo />
  </div>
{/await}

<style>
  .hole_screen {
    width: 100%;
    height: 100vh;
    display: flex;
  }

  .map_container {
    flex: 1;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
