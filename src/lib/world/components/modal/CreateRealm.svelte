<script lang="ts">
  import { HttpStatusCode } from "axios";
  import { type ProvinceClass } from "../../../../dataTypes/packCellsType";
  import { getPoliticalEntitySetKr } from "../../../../utils";
  import {
    internalAffairs,
    myRealmIdStored,
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
    worldTime,
    mapNode,
    dialog,
  }: {
    currentCellInfo: CurrentCellInfoType;
    worldTime: string;
    mapNode: SVGSVGElement;
    dialog: HTMLDialogElement;
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
      !worldTime
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
      init_date: worldTime,
      population: currentCellInfo.population,
    });
    if (res.status === HttpStatusCode.Ok) {
      worldMetadata.fillRealm([i], `0x${hexColor}`);
      const capitalGroup = select(mapNode!).select("#capitals");
      if (!capitalGroup) {
        alert("올바르지 않은 svg입니다.");
        return;
      }
      const {
        my_realm: {
          id,
          name,
          owner_nickname,
          capital_number,
          political_entity,
          color,
          population_growth_rate,
          state_coffers,
          census_at,
          tax_collection_at,
        },
      } = res.data;
      sectorRealmMapStored.set(i, id);
      realmInfoMapStored.set(id, {
        id,
        name,
        owner_nickname,
        capital_number,
        political_entity,
        color,
      });
      // 내정 정보 업데이트
      internalAffairs.populationGrowthRate = population_growth_rate;
      internalAffairs.stateCoffers = state_coffers;
      internalAffairs.censusAt = census_at;
      internalAffairs.taxCollectionAt = tax_collection_at;
      $myRealmIdStored = id;
      document.querySelector(".population")!.innerHTML =
        currentCellInfo.population.toString();
      document.querySelector(".country_name")!.innerHTML = name;
      const { politicalEntity, status } =
        getPoliticalEntitySetKr(political_entity);
      document.querySelector(".political_entity")!.innerHTML = politicalEntity;
      document.querySelector(".status")!.innerHTML = status;
      worldMetadata.drawCapital(i, id, capitalGroup);
      $showModal = false;
      setMapInteractionMode("NORMAL");
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
