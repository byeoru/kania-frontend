<script lang="ts">
  import {
    getPoliticalEntityKr,
    type CurrentCellInfoType,
  } from "../../../dataTypes/aboutUiType";
  import type {
    FeatureClass,
    ProvinceClass,
  } from "../../../dataTypes/packCellsType";
  import { getElevation, openModal } from "../../../utils";
  import {
    isMyRealmId,
    realmInfoMapStored,
    sectorRealmMapStored,
  } from "../../shared.svelte";
  import { worldMetadata } from "../worldMetadata";
  import Muster from "./modal/Muster.svelte";

  const {
    mapNode,
    layerNode,
    cellInfo,
    updateCellInfoFn,
    worldTime,
  }: {
    mapNode: SVGSVGElement | undefined;
    layerNode: SVGSVGElement | undefined;
    cellInfo: CurrentCellInfoType | undefined;
    updateCellInfoFn: (newInfo: CurrentCellInfoType) => void;
    worldTime: Date | undefined;
  } = $props();

  let realm = $derived.by(() => {
    if (!cellInfo?.i) return;
    const selectedRealmId = sectorRealmMapStored.get(cellInfo.i);
    if (selectedRealmId) {
      return {
        selectedRealmId,
        realmInfo: realmInfoMapStored.get(selectedRealmId),
      };
    }
    return {
      selectedRealmId: undefined,
      realmInfo: undefined,
    };
  });
  let countryName = $derived.by(() => {
    if (realm?.selectedRealmId) {
      return realm.realmInfo?.name ?? "없음";
    }
    return "없음";
  });
  let politicalEntitySet = $derived.by(() => {
    return getPoliticalEntityKr(realm?.realmInfo?.political_entity ?? "");
  });
  let monarch = $derived.by(() => {
    if (realm?.selectedRealmId) {
      return realm.realmInfo?.owner_nickname ?? "없음";
    }
    return "없음";
  });
  let provinceName = $derived.by(() => {
    if (cellInfo?.provinceId) {
      return (
        worldMetadata.pack!.cells.provinces[
          cellInfo.provinceId
        ] as ProvinceClass
      ).fullName;
    }
    return "정보 없음";
  });
  let elevation = $derived.by(() => {
    if (!cellInfo) return "정보 없음";
    const feature = worldMetadata.pack!.cells.features[
      worldMetadata.pack!.cells.cells.f[cellInfo.i]
    ] as FeatureClass;
    const elevation = getElevation(feature, cellInfo.elevation);
    return elevation;
  });

  async function onCensusClick() {
    if (!worldTime) return;
    // await realmApi.excuteCensus({ current_date: worldTime });
  }

  async function onMusterClick() {
    if (!worldTime) return;
    if (!mapNode) {
      alert("아직 지도가 초기화되지 않았습니다.");
      return;
    }
    openModal("부대 창설", Muster, {
      layerNode,
      currentCellInfo: cellInfo,
      updateCellInfoFn,
    });
  }
</script>

<div class="region_info">
  <div class="top_left"></div>
  <div class="top_right"></div>
  <div class="bottom_left"></div>
  <div class="bottom_right"></div>
  <div class="region_info_title">
    <div class="region_info_title_icon"></div>
  </div>
  {#if cellInfo}
    <section class="country_info">
      <span class="section_header"
        ><span class="section_header_icon"></span>통치 세력</span
      >
      {#if realm?.selectedRealmId}
        <div class="section_item">
          <span class="item_title">국명</span>
          <span class="item_content country_name">{countryName}</span>
        </div>
        <div class="section_item">
          <span class="item_title">정치 체제</span>
          <span class="item_content political_entity"
            >{politicalEntitySet.politicalEntity}</span
          >
        </div>
        <div class="section_item">
          <span class="item_title">통치자</span>
          <span class="item_content monarch">{monarch}</span>
          <div class="section_item">
            <span class="item_title">지위</span>
            <span class="item_content status">{politicalEntitySet.status}</span>
          </div>
        </div>
      {:else if cellInfo.type === "island"}
        <div class="section_item">
          <span class="item_content monarch">토착세력</span>
        </div>
      {/if}
    </section>
    <section class="province_info">
      <span class="section_header"
        ><span class="section_header_icon"></span>주(州)</span
      >
      {#if cellInfo.type === "island"}
        <div class="section_item">
          <span class="item_content">{provinceName}</span>
        </div>
      {/if}
    </section>
    <section class="sector_info">
      <span class="section_header"
        ><span class="section_header_icon"></span>군(郡)</span
      >
      {#if cellInfo.type === "island"}
        <div class="section_item">
          <span class="item_title">군명</span>
          <span class="item_content">{`${provinceName}-${cellInfo.i}`}</span>
        </div>
      {/if}
      {#if cellInfo.type === "island" && (isMyRealmId(sectorRealmMapStored.get(cellInfo.i)) || !sectorRealmMapStored.has(cellInfo.i))}
        <div class="section_item">
          <span class="item_title">인구</span>
          <span class="item_content population">{cellInfo.population}</span>
        </div>
      {/if}
      <div class="section_item">
        <span class="item_title">고도</span>
        <span class="item_content">{elevation}</span>
      </div>
    </section>
    {#if cellInfo.indigenousUnit}
      <section class="indigenous_unit_info">
        <span class="section_header"
          ><span class="section_header_icon"></span>향군(鄕軍)</span
        >
        <div class="section_item">
          <span class="item_title">검병</span>
          <span class="item_content swordmen"
            >{cellInfo.indigenousUnit.swordmen}</span
          >
        </div>
        <div class="section_item">
          <span class="item_title">궁병</span>
          <span class="item_content archers"
            >{cellInfo.indigenousUnit.archers}</span
          >
        </div>
        <div class="section_item">
          <span class="item_title">창기병</span>
          <span class="item_content lancers"
            >{cellInfo.indigenousUnit.lancers}</span
          >
        </div>
      </section>
    {/if}
    {#if cellInfo.i && isMyRealmId(sectorRealmMapStored.get(cellInfo.i))}
      <section class="internal_affairs">
        <div class="internal_affairs_header">내정</div>
        <div class="section_item">
          <button class="census_btn" onclick={onCensusClick}
            ><div class="icon"></div>
            인구조사</button
          >
        </div>
        <div class="section_item">
          <button class="tax_collection_btn"
            ><div class="icon"></div>
            세금 징수</button
          >
        </div>
        <div class="section_item">
          <button class="muster_btn" onclick={onMusterClick}
            ><div class="icon"></div>
            부대 창설</button
          >
        </div>
      </section>
    {/if}
  {/if}
</div>

<style>
  .region_info {
    width: 16rem;
    height: 100%;
    background-color: #f04c00;
    z-index: 3;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: start;
    align-items: start;
    background-image: url("/assets/img/carving.png");
    background-size: 100% 100%;
  }

  .top_left {
    width: 2.5em;
    height: 2.5em;
    position: absolute;
    top: 0;
    left: 0;
    background-image: url("/assets/img/top_left_corner.png");
    background-size: 100% 100%;
  }

  .top_right {
    width: 2.5em;
    height: 2.5em;
    position: absolute;
    top: 0;
    right: 0;
    background-image: url("/assets/img/top_right_corner.png");
    background-size: 100% 100%;
  }

  .bottom_left {
    width: 2.5em;
    height: 2.5em;
    position: absolute;
    bottom: 0;
    left: 0;
    background-image: url("/assets/img/bottom_left_corner.png");
    background-size: 100% 100%;
  }

  .bottom_right {
    width: 2.5em;
    height: 2.5em;
    position: absolute;
    bottom: 0;
    right: 0;
    background-image: url("/assets/img/bottom_right_corner.png");
    background-size: 100% 100%;
  }

  .region_info_title {
    width: 100%;
    height: 2.5em;
    background-image: url("/assets/img/label_merge.png");
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .region_info_title_icon {
    width: 3.5em;
    height: 1.5em;
    margin-top: 0.5em;
    background-image: url("/assets/img/mm_ornament.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  section {
    width: 96%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-left: 0.2em;
    margin-bottom: 1em;
  }

  .section_item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding-left: 0.5em;
    padding-right: 0.5em;
  }

  .section_header {
    width: 100%;
    height: 1.5em;
    font-size: 1em;
    font-weight: bold;
    background-image: url("/assets/img/form.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    gap: 0.3em;
    padding-left: 0.3em;
    color: rgb(136, 93, 36);
  }

  .section_header_icon {
    height: 80%;
    aspect-ratio: 1;
    background-image: url("/assets/img/pp.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .item_title {
    font-size: 0.9em;
    font-weight: 700;
    text-shadow: 0.3px 0.3px 1px rgba(175, 162, 162, 0.5);
  }

  .item_content {
    font-size: 0.8em;
    font-weight: 600;
    color: rgb(129, 129, 129);
  }

  .internal_affairs {
    width: 99%;
    flex: 1;
    background-image: url("/assets/img/base_merge.png");
    background-size: 100% 300%;
    background-repeat: no-repeat;
    padding: 0em;
    margin-bottom: 0em;
  }

  .internal_affairs_header {
    width: 100%;
    height: 2em;
    font-size: 1em;
    font-weight: bold;
    background-image: url("/assets/img/left_side_bar.png");
    background-size: 99% 100%;
    background-repeat: no-repeat;
    color: rgb(136, 93, 36);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .census_btn,
  .tax_collection_btn,
  .muster_btn {
    width: 100%;
    height: 3.5em;
    position: relative;
    background-image: url("/assets/img/optiontab_n.png");
    background-size: 100% 100%;
    color: rgb(136, 93, 36);
    font-size: 0.8em;
    font-weight: bold;
  }

  .census_btn,
  .muster_btn {
    cursor: url("/assets/img/quest_cursor.png"), auto;
  }

  .tax_collection_btn {
    cursor: url("/assets/img/loot_cursor.png"), auto;
  }

  .census_btn .icon {
    width: 2.5em;
    height: 2.5em;
    position: absolute;
    left: 0.5em;
    top: 50%;
    margin-top: -1.25em;
    background-image: url("/assets/img/abilities_h.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .tax_collection_btn .icon {
    width: 2.5em;
    height: 2.5em;
    position: absolute;
    left: 0.5em;
    top: 50%;
    margin-top: -1.25em;
    background-image: url("/assets/img/inventory_h.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .muster_btn .icon {
    width: 2.5em;
    height: 2.5em;
    position: absolute;
    left: 0.5em;
    top: 50%;
    margin-top: -1.25em;
    background-image: url("/assets/img/character_h.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
</style>
