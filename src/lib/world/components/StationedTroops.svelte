<script lang="ts">
  import type { CurrentCellInfoType } from "../../../dataTypes/aboutUiType";
  import { myRealmLeviesStored } from "../../shared.svelte";
  import LevyInfo from "./LevyInfo.svelte";

  let {
    cellInfo,
  }: {
    cellInfo: CurrentCellInfoType | undefined;
  } = $props();
  const levies = $derived(
    cellInfo ? myRealmLeviesStored.get(cellInfo.i) : undefined,
  );
</script>

{#if levies}
  <div class="levy_info">
    <div class="top_border">주둔 병력</div>
    <div class="levy_list">
      {#each levies as levy}
        <LevyInfo levy={levy.levy} realmMemberId={levy.realmMemberId} />
      {/each}
    </div>
  </div>
{/if}

<style>
  .levy_info {
    width: 10em;
    max-height: 30em;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 10em;
    left: 0em;
    z-index: 5;
    margin-left: 0.1em;
  }

  .top_border {
    width: 100%;
    padding-bottom: 0.6em;
    background-image: url("/assets/img/qt_border.png");
    background-size: 100%;
    background-repeat: no-repeat;
    background-position-y: bottom;
    text-align: center;
    color: white;
    font-size: 1em;
  }
  .levy_list {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2em 0em;
    overflow-y: auto;
  }
</style>
