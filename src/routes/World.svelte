<script lang="ts">
  import type { CurrentCellInfoType } from "../dataTypes/aboutUiType";
  import Modal from "../lib/Modal.svelte";
  import {
    getMapInteractionMode,
    getWebsocketClient,
    getWorldTime,
    modalContent,
    modalProps,
    modalTitle,
    showModal,
    updateWorldTime,
  } from "../lib/shared.svelte.ts";
  import Map from "../lib/world/components/Map.svelte";
  import MyInfo from "../lib/world/components/MyInfo.svelte";
  import NormalModeBtn from "../lib/world/components/NormalModeBtn.svelte";
  import RegionInfo from "../lib/world/components/RegionInfo.svelte";
  import StationedTroops from "../lib/world/components/StationedTroops.svelte";
  import {
    onKeyUp,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
  } from "../lib/world/eventHandler.ts";

  let mapContainer = $state<HTMLDivElement>();
  let mapSVG = $state<SVGSVGElement>();
  let mapLayerSVG = $state<SVGSVGElement>();
  let mapGroup = $state<HTMLDivElement>();
  let currentCellInfo = $state<CurrentCellInfoType>();

  $effect(() => {
    return () => {
      getWebsocketClient()?.close();
    };
  });

  $effect(() => {
    const intervalId = setInterval(() => {
      updateWorldTime();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  const updateCellInfoFn = (newInfo: CurrentCellInfoType) => {
    currentCellInfo = newInfo;
  };
</script>

{#if $showModal}
  <Modal header={modalTitle} props={modalProps} children={modalContent} />
{/if}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="whole_screen"
  onmousemove={(event) => onMouseMove(event, mapContainer, mapGroup)}
  onmouseup={() => onMouseUp(mapSVG)}
  onmouseleave={onMouseLeave}
  onkeyup={onKeyUp}
>
  <MyInfo worldTime={getWorldTime()} />
  <StationedTroops cellInfo={currentCellInfo} />
  <div class="map_container" bind:this={mapContainer}>
    <Map
      {mapContainer}
      bind:mapNode={mapSVG}
      bind:layerNode={mapLayerSVG}
      bind:mapGroup
      bind:currentCellInfo
      {updateCellInfoFn}
    />
  </div>
  <RegionInfo
    mapNode={mapSVG}
    layerNode={mapLayerSVG}
    cellInfo={currentCellInfo}
    {updateCellInfoFn}
    worldTime={getWorldTime()}
  />
  {#if getMapInteractionMode() === "ATTACK"}
    <NormalModeBtn />
  {/if}
</div>

<style>
  .whole_screen {
    width: 100%;
    height: 100vh;
    display: flex;
    z-index: 7;
    position: relative;
  }

  .map_container {
    flex: 1;
    height: 100vh;
    overflow: scroll;
    position: relative;
    scrollbar-width: none;
    z-index: 5;
  }
</style>
