<script lang="ts">
  import { HttpStatusCode } from "axios";
  import type { CurrentCellInfoType } from "../dataTypes/aboutUiType";
  import { type ProvinceClass } from "../dataTypes/packCellsType";
  import Modal from "../lib/Modal.svelte";
  import { mapInteractionMode, realmsStored, showModal } from "../lib/shared";
  import { realmApi } from "../lib/world/api/realm";
  import Map from "../lib/world/components/Map.svelte";
  import MyInfo from "../lib/world/components/MyInfo.svelte";
  import RegionInfo from "../lib/world/components/RegionInfo.svelte";
  import {
    onMouseLeave,
    onMouseMove,
    onMouseUp,
  } from "../lib/world/eventHandler";
  import { worldMetadata } from "../lib/world/worldMetadata";
  import { select } from "d3";

  let mapContainer = $state<HTMLDivElement>();
  let childMap = $state<SVGSVGElement>();
  let mapGroup = $state<HTMLDivElement>();
  let currentCellInfo = $state<CurrentCellInfoType>();
</script>

{#if $showModal}
  <Modal>
    {#snippet header()}
      <h2>생성</h2>
    {/snippet}
    <form
      class="create_realm_form"
      onsubmit={async (event: SubmitEvent) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const { countryName, realmColor } = form;

        if (
          !currentCellInfo ||
          !currentCellInfo.i ||
          !currentCellInfo.provinceId
        ) {
          // error handle
          return;
        }
        const i = currentCellInfo.i;
        const hexColor = (realmColor.value as string).slice(1);
        const res = await realmApi.establishRealm({
          name: countryName.value,
          cell_number: currentCellInfo.i,
          province_number: currentCellInfo.provinceId,
          realm_color: realmColor.value,
        });
        if (res.status === HttpStatusCode.Ok) {
          worldMetadata.fillRealm([i], `0x${hexColor}`);
          const capitalGroup = select(childMap!).select("#capitals");
          if (!capitalGroup) {
            alert("올바르지 않은 svg입니다.");
            return;
          }
          worldMetadata.drawCapital(i, res.data.ream_id, capitalGroup);
          $showModal = false;
          $mapInteractionMode = "NORMAL";
        }
      }}
    >
      <div class="input_area">
        <div class="input_row">
          <label for="countryName" class="label_text">국가명</label>
          <input
            type="text"
            required
            minlength="1"
            maxlength="10"
            id="countryName"
            name="countryName"
          />
        </div>
        <div class="input_row">
          <label for="realmColor" class="label_text">영역 색상</label>
          <input type="color" id="realmColor" name="realmColor" />
        </div>
      </div>

      <div class="additional_information">
        <div class="input_row">
          <label for="politicalEntity" class="label_text">정치 체제</label>
          <input
            type="text"
            id="politicalEntity"
            name="politicalEntity"
            disabled
            value="부족국가"
          />
        </div>
        <div class="input_row">
          <label for="province" class="label_text">지역</label>
          <input
            type="text"
            id="province"
            name="province"
            disabled
            value={(
              worldMetadata.pack?.cells.provinces[
                currentCellInfo?.provinceId!
              ] as ProvinceClass
            ).fullName}
          />
        </div>
      </div>

      <div class="buttons">
        <button type="submit">확인</button>
        <button onclick={() => ($showModal = false)}>취소</button>
      </div>
    </form>
  </Modal>
{/if}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="hole_screen"
  onmousemove={(event) => onMouseMove(event, mapContainer, mapGroup)}
  onmouseup={() => onMouseUp(childMap)}
  onmouseleave={onMouseLeave}
>
  <MyInfo realmStored={realmsStored} />
  <div class="map_container" bind:this={mapContainer}>
    <Map
      {mapContainer}
      bind:mapNode={childMap}
      bind:mapGroup
      bind:currentCellInfo
    />
  </div>
  <RegionInfo cellInfo={currentCellInfo} />
</div>

<style>
  .hole_screen {
    width: 100%;
    height: 100vh;
    display: flex;
    z-index: 6;
  }

  .map_container {
    flex: 1;
    height: 100vh;
    overflow: hidden;
    position: relative;
    z-index: 4;
  }

  .create_realm_form {
    display: flex;
    flex-direction: column;
    gap: 0em 1.5em;
  }

  .input_row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0em 1.3em;
  }

  .input_area {
    margin-bottom: 1.5em;
    display: flex;
    flex-direction: column;
    gap: 0.5em 0em;
  }

  .additional_information {
    display: flex;
    flex-direction: column;
    gap: 0.5em 0em;
  }

  .input_row input {
    border-width: 0;
    background-color: whitesmoke;
    font-size: 0.8em;
    font-weight: 500;
    color: rosybrown;
    border-radius: 0.2em;
    padding: 0.3em 0.5em;
  }

  .input_row input:focus {
    outline: none;
  }

  .label_text {
    font-size: 0.8em;
    font-weight: 700;
  }

  button {
    margin-left: 0.3em;
    margin-right: 0.3em;
    margin-top: 0.8em;
    margin-bottom: 0.8em;
  }
  .buttons {
    display: flex;
    justify-content: end;
    align-items: center;
  }
</style>
