<script lang="ts">
  import MyInfo from "../lib/world/components/MyInfo.svelte";
  import RegionInfo from "../lib/world/components/RegionInfo.svelte";
  import {
    onMouseDown,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    onWheel,
  } from "../lib/world/eventHandler";
  import { mapInteraction } from "../lib/world/mapInteraction";
  import { worldMetadata } from "../lib/world/worldMetadata";

  let mapContainer: HTMLDivElement | null = $state(null);
  let mapElement: SVGSVGElement;

  $effect(() => {
    const mapNode = mapContainer?.querySelector("svg");
    if (!mapNode) {
      return;
    }
    worldMetadata.loadMetadata();

    mapElement = mapNode;
    mapElement.addEventListener("mousedown", onMouseDown);
    mapElement.addEventListener("wheel", (event) =>
      onWheel(event, mapContainer!!, mapElement),
    );

    // 초기 map scale value setting
    const containerRect = mapContainer!!.getBoundingClientRect();
    const mapRect = mapElement.getBoundingClientRect();

    const { elementDeltaMaxX, elementDeltaMaxY } =
      mapInteraction.getElementMaxDelta(containerRect, mapRect);

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
        onWheel(event, mapContainer!!, mapElement),
      );
    };
  });

  const loadMap = async (path: string) => {
    const res = await fetch(path);
    const svgContent = await res.text();
    return svgContent;
  };

  const mapPs = loadMap("/src/assets/map/kania.svg");
  const metaData = worldMetadata.loadMetadata();
</script>

{#await mapPs then map}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="hole_screen"
    onmousemove={(event) => onMouseMove(event, mapContainer!!, mapElement)}
    onmouseup={() => onMouseUp(mapElement)}
    onmouseleave={onMouseLeave}
  >
    <MyInfo />
    <div class="map_container" bind:this={mapContainer}>
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
