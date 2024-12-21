<script lang="ts">
  import type { CurrentCellInfoType } from "../../../dataTypes/aboutUiType";
  import type { ProvinceClass } from "../../../dataTypes/packCellsType";
  import { worldMetadata } from "../worldMetadata";

  const { cellInfo }: { cellInfo: CurrentCellInfoType | undefined } = $props();

  const provinceName = $derived(
    cellInfo?.provinceId
      ? (
          worldMetadata.pack!.cells.provinces[
            cellInfo!.provinceId
          ] as ProvinceClass
        ).fullName
      : "정보 없음",
  );

  const politicalEntitySet = $derived(() => {
    let politicalEntity = "없음";
    let status = "없음";
    switch (cellInfo?.political_entity) {
      case "Tribe":
        politicalEntity = "부족국가";
        status = "추장";
        break;
      case "TribalConfederation":
        politicalEntity = "부족 연맹";
        status = "대추장";
        break;
      case "Kingdom":
        politicalEntity = "왕국";
        status = "왕";
        break;
      case "KingdomConfederation":
        politicalEntity = "왕국 연맹";
        status = "대왕";
        break;
      case "Empire":
        politicalEntity = "제국";
        status = "황제";
        break;
      case "FeudatoryState":
        politicalEntity = "번국";
        status = "번왕";
        break;
    }
    return { politicalEntity, status };
  });
</script>

<div class="region_info">
  <section class="country_info">
    <span class="section_header">통치 세력</span>
    <div class="section_item">
      <span class="item_title">국명</span>
      <span class="item_content">{cellInfo?.countryName ?? "없음"}</span>
    </div>
    <div class="section_item">
      <span class="item_title">정치 체제</span>
      <span class="item_content">{politicalEntitySet().politicalEntity}</span>
    </div>
    <div class="section_item">
      <span class="item_title">통치자</span>
      <span class="item_content">{cellInfo?.nickname ?? "없음"}</span>
      <div class="section_item">
        <span class="item_title">지위</span>
        <span class="item_content">{politicalEntitySet().status}</span>
      </div>
    </div>
  </section>
  <section class="province_info">
    <span class="section_header">주(州)</span>
    <div class="section_item">
      <span class="item_content">{provinceName}</span>
    </div>
  </section>
  <section class="sector_info">
    <span class="section_header">군(郡)</span>
    <div class="section_item">
      <span class="item_title">인구</span>
      <span class="item_content">{cellInfo?.population ?? "정보 없음"}</span>
    </div>
    <div class="section_item">
      <span class="item_title">고도</span>
      <span class="item_content">{cellInfo?.elevation ?? "정보 없음"}</span>
    </div>
  </section>
</div>

<style>
  .region_info {
    width: 16rem;
    height: 100%;
    background-color: #853f1f;
    z-index: 3;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    gap: 0.7em;
  }

  section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.5em;
    padding-left: 1em;
  }

  .section_item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding-left: 0.5em;
  }

  .section_header {
    font-size: 1em;
    font-weight: bold;
  }

  .item_title {
    font-size: 0.9em;
    font-weight: 700;
  }
  .item_content {
    font-size: 0.8em;
    font-weight: 600;
    color: rgb(41, 28, 14);
  }
</style>
