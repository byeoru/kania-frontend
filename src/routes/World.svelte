<script lang="ts">
  import type { CurrentCellInfoType } from "../dataTypes/currentCellInfoType";
  import Map from "../lib/world/components/Map.svelte";
  import MyInfo from "../lib/world/components/MyInfo.svelte";
  import RegionInfo from "../lib/world/components/RegionInfo.svelte";
  import {
    onMouseLeave,
    onMouseMove,
    onMouseMoveMetadata,
    onMouseUp,
  } from "../lib/world/eventHandler";

  let mapContainer: HTMLDivElement | undefined = $state();
  let childMap: SVGSVGElement | undefined = $state();
  let currentCellInfo = $state<CurrentCellInfoType>();

  const updateCurrentCellInfo = (newInfo: CurrentCellInfoType) => {
    currentCellInfo = newInfo;
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="hole_screen"
  onmousemove={(event) => onMouseMove(event, mapContainer!, childMap)}
  onmouseup={() => onMouseUp(childMap)}
  onmouseleave={onMouseLeave}
>
  <MyInfo cellInfo={currentCellInfo} />
  <div
    class="map_container"
    bind:this={mapContainer}
    onmousemove={(event) =>
      onMouseMoveMetadata(event, childMap, updateCurrentCellInfo)}
  >
    <Map {mapContainer} bind:map={childMap} />
  </div>
  <RegionInfo />
</div>

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
