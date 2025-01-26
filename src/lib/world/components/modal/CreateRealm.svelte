<script lang="ts">
  import { HttpStatusCode } from "axios";
  import { type ProvinceClass } from "../../../../dataTypes/packCellsType";
  import {
    addMyRealmId,
    internalAffairs,
    myRealmPopulationStored,
    realmInfoMapStored,
    sectorRealmMapStored,
    setMapInteractionMode,
    showModal,
  } from "../../../shared.svelte";
  import { realmApi } from "../../api/realm";
  import { worldMetadata } from "../../worldMetadata";
  import { select } from "d3";
  import type { CurrentCellInfoType } from "../../../../dataTypes/aboutUiType";
  import FooterBtn from "./FooterBtn.svelte";

  let {
    currentCellInfo,
    updateCellInfoFn,
    svgLayer,
  }: {
    currentCellInfo: CurrentCellInfoType;
    updateCellInfoFn: (newInfo: CurrentCellInfoType) => void;
    svgLayer: SVGSVGElement;
  } = $props();
</script>

<form
  class="create_realm_form"
  onsubmit={async (event: SubmitEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const { countryName, realmColor } = form;

    if (
      !currentCellInfo ||
      !currentCellInfo.i ||
      !currentCellInfo.provinceId ||
      !svgLayer
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
      population: currentCellInfo.population,
    });

    switch (res.status) {
      case HttpStatusCode.Ok:
        worldMetadata.fillRealm([i], `0x${hexColor}`);
        const capitalGroup = select(svgLayer!).select("#capitals");
        if (!capitalGroup) {
          alert("올바르지 않은 svg입니다.");
          return;
        }
        const {
          my_realm: {
            id,
            name,
            owner_nickname,
            capitals,
            political_entity,
            color,
            population_growth_rate,
            state_coffers,
            census_at,
            tax_collection_at,
          },
        } = res.data;
        sectorRealmMapStored.set(i, id);
        myRealmPopulationStored.set(i, currentCellInfo.population);
        realmInfoMapStored.set(id, {
          id,
          name,
          owner_nickname,
          capitals,
          political_entity,
          color,
        });
        // 내정 정보 업데이트
        internalAffairs.populationGrowthRate = population_growth_rate;
        internalAffairs.stateCoffers = state_coffers;
        internalAffairs.censusAt = census_at;
        internalAffairs.taxCollectionAt = tax_collection_at;
        addMyRealmId(id);
        updateCellInfoFn({
          ...currentCellInfo,
          population: currentCellInfo.population,
        });
        worldMetadata.drawCapitals(capitals, id, capitalGroup);
        $showModal = false;
        setMapInteractionMode("NORMAL");
        break;
      default:
        alert(res.data.api_response.errorCode);
        break;
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
  <FooterBtn agreeTitle="생성" cancelTitle="취소" />
</form>

<style>
  .create_realm_form {
    width: 95%;
    height: 25.8em;
    display: flex;
    flex-direction: column;
  }

  .input_row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .input_area {
    margin-top: 1em;
    margin-bottom: 1.5em;
    display: flex;
    flex-direction: column;
    gap: 0.7em 0em;
  }

  label {
    font-size: 0.8em;
    font-weight: 700;
    color: rgb(136, 93, 36);
  }

  .additional_information {
    display: flex;
    flex-direction: column;
    gap: 0.7em 0em;
  }

  .input_row input {
    border-width: 0;
    background-color: rgb(45, 30, 11);
    font-size: 0.8em;
    font-weight: 600;
    color: rosybrown;
    border-radius: 0.1em;
    padding: 0.3em 0.5em;
  }

  .input_row input:focus {
    outline: none;
  }
</style>
