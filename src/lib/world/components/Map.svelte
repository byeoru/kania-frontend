<script lang="ts">
  import { select } from "d3";
  import { worldMetadata } from "../worldMetadata";
  import { onMouseDown, onWheel } from "../eventHandler";
  import { mapInteraction } from "../mapInteraction";
  import Loading from "../../Loading.svelte";

  let mapNode: SVGSVGElement | undefined = $state();

  let {
    mapContainer,
    map = $bindable(),
  }: {
    mapContainer: HTMLDivElement | undefined;
    map: SVGSVGElement | undefined;
  } = $props();

  $effect(() => {
    if (!mapContainer || !mapNode) {
      return;
    }
    map = mapNode;
    const svgViewbox = select("#fantasyMap").select("#viewbox");
    const cellsLayer = svgViewbox
      .append("g")
      .attr("id", "cells")
      .attr("stroke", "#808080")
      .attr("stroke-width", 0.007)
      .style("fill", "none");

    // prepare cells border data
    worldMetadata.prepareCellsBorder();

    mapNode.addEventListener("mousedown", onMouseDown);
    mapNode.addEventListener("wheel", (event) =>
      onWheel(event, mapContainer, mapNode, cellsLayer),
    );

    // 초기 map scale value setting
    const containerRect = mapContainer.getBoundingClientRect();
    const mapRect = mapNode.getBoundingClientRect();

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
      mapNode.style.transform = `scale(${mapInteraction.minScale})`;
    }

    return () => {
      mapNode?.removeEventListener("mousedown", onMouseDown);
      mapNode?.removeEventListener("wheel", (event) =>
        onWheel(event, mapContainer, mapNode, cellsLayer),
      );
    };
  });

  const loadMap = async (path: string) => {
    const res = await fetch(path);
    const svgContent = await res.text();
    return svgContent;
  };

  const mapInit = async () => {
    await worldMetadata.loadMetadata();
    worldMetadata.createQuadtree();

    const mapHtml = await loadMap("/src/assets/map/kania.svg");
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
</script>

{#await mapInit()}
  <Loading description="데이터를 불러오는 중입니다" />
{:then mapContents}
  <svg
    id="fantasyMap"
    bind:this={mapNode}
    width="1440"
    height="812"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    {@html mapContents}
  </svg>
{/await}
