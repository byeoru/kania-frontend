<script lang="ts">
  import type { CurrentCellInfoType } from "../dataTypes/aboutUiType";
  import Modal from "../lib/Modal.svelte";
  import {
    getMapInteractionMode,
    getWorldTime,
    modalContent,
    modalProps,
    modalTitle,
    myRealmIdStored,
    setWorldTime,
    showModal,
    ws,
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
  import type { RealmMemberIDsType } from "../model/realm_member.ts";
  import type { MessageType } from "../model/ws";

  let mapContainer = $state<HTMLDivElement>();
  let childMap = $state<SVGSVGElement>();
  let mapGroup = $state<HTMLDivElement>();
  let currentCellInfo = $state<CurrentCellInfoType>();

  $effect(() => {
    return () => {
      ws.close();
    };
  });

  ws.onmessage = (event) => {
    const data: MessageType = JSON.parse(event.data);
    if (data.title !== "worldTime") {
      return;
    }
    // Base64 디코딩
    const decodedDate = atob(data.body); // atob는 Base64 디코딩을 하는 함수

    setWorldTime(decodedDate);
  };
</script>

{#if $showModal}
  <Modal header={modalTitle} props={modalProps} children={modalContent} />
{/if}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="whole_screen"
  onmousemove={(event) => onMouseMove(event, mapContainer, mapGroup)}
  onmouseup={() => onMouseUp(childMap)}
  onmouseleave={onMouseLeave}
  onkeyup={onKeyUp}
>
  <MyInfo myRealmId={$myRealmIdStored} worldTime={getWorldTime()} />
  <StationedTroops cellInfo={currentCellInfo} />
  <div class="map_container" bind:this={mapContainer}>
    <Map
      {mapContainer}
      bind:mapNode={childMap}
      bind:mapGroup
      bind:currentCellInfo
    />
  </div>
  <RegionInfo
    myRealmId={$myRealmIdStored}
    cellInfo={currentCellInfo}
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
    z-index: 6;
    position: relative;
  }

  .map_container {
    flex: 1;
    height: 100vh;
    overflow: hidden;
    position: relative;
    z-index: 4;
  }
</style>
