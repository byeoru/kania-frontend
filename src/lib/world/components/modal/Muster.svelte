<script lang="ts">
  import type { CurrentCellInfoType } from "../../../../dataTypes/aboutUiType";
  import FooterBtn from "./FooterBtn.svelte";
  import {
    myRealmPopulationStored,
    showModal,
    storeCellLevies,
  } from "../../../shared.svelte";
  import { HttpStatusCode } from "axios";
  import { levyApi } from "../../api/levy";
  import { select } from "d3";
  import { worldMetadata } from "../../worldMetadata";

  let {
    mapNode,
    currentCellInfo,
    updateCellInfoFn,
  }: {
    mapNode: SVGSVGElement;
    currentCellInfo: CurrentCellInfoType;
    updateCellInfoFn: (newInfo: CurrentCellInfoType) => void;
  } = $props();

  let swordmen = $state(0);
  let archers = $state(0);
  let shieldBearers = $state(0);
  let lancers = $state(0);
  let supplyTroop = $state(0);
</script>

<form
  class="muster_form"
  onsubmit={async (event: SubmitEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const {
      unitName: { value: unitNameValue },
    } = form;
    if (
      swordmen + archers + shieldBearers + lancers + supplyTroop >
      currentCellInfo.population
    ) {
      alert("징집하려는 병사 수가 인구 수를 초과합니다.");
      return;
    }
    const res = await levyApi.muster({
      name: unitNameValue,
      encampment: currentCellInfo.i,
      swordmen: swordmen,
      archers: archers,
      shield_bearers: shieldBearers,
      lancers: lancers,
      supply_troop: supplyTroop,
    });

    switch (res.status) {
      case HttpStatusCode.Ok:
        $showModal = false;
        alert("군사 징집이 완료되었습니다.");
        // store에 levy 정보를 추가
        storeCellLevies([
          {
            levy_affiliation: res.data.Levy_affiliation,
            levies: [res.data.levy],
          },
        ]);
        // 변경된 인구 수 업데이트
        myRealmPopulationStored.set(currentCellInfo.i, res.data.population);
        // map에 defense flag 표시
        const unitFlagsGroup = select(mapNode!).select("#unit_flags");
        worldMetadata.drawDefenseUnitFlag(
          res.data.levy.encampment,
          unitFlagsGroup,
        );

        updateCellInfoFn({
          ...currentCellInfo,
          population: res.data.population,
        });
        break;
      case HttpStatusCode.NotFound:
        alert("소속된 국가가 존재하지 않습니다.");
        break;
      case HttpStatusCode.UnprocessableEntity:
        alert(res.data.api_response.description);
        break;
      case HttpStatusCode.InternalServerError:
        alert("서버 오류가 발생했습니다.");
        break;
    }
  }}
>
  <div class="unit_name_container">
    <label for="unit_name"
      ><div class="unit_name_icon"></div>
      부대명</label
    >
    <input type="text" name="unitName" id="unit_name" minlength="1" />
  </div>
  <div class="input_col">
    <div class="input_row">
      <label for="swordmen">검병</label>
      <input
        type="number"
        name="swordmen"
        id="swordmen"
        min="0"
        bind:value={swordmen}
      />
    </div>
    <span class="cost">{swordmen * 50}</span>
  </div>
  <div class="input_col">
    <div class="input_row">
      <label for="archers">궁병</label>
      <input
        type="number"
        name="archers"
        id="archers"
        min="0"
        bind:value={archers}
      />
    </div>
    <span class="cost">{archers * 65}</span>
  </div>
  <div class="input_col">
    <div class="input_row">
      <label for="shieldBearers">방패병</label>
      <input
        type="number"
        name="shieldBearers"
        id="shieldBearers"
        min="0"
        bind:value={shieldBearers}
      />
    </div>
    <span class="cost">{shieldBearers * 80}</span>
  </div>
  <div class="input_col">
    <div class="input_row">
      <label for="lancers">창기병</label>
      <input
        type="number"
        name="lancers"
        id="lancers"
        min="0"
        bind:value={lancers}
      />
    </div>
    <span class="cost">{lancers * 105}</span>
  </div>
  <div class="input_col">
    <div class="input_row">
      <label for="supplyTroop">보급병</label>
      <input
        type="number"
        name="supplyTroop"
        id="supplyTroop"
        min="0"
        bind:value={supplyTroop}
      />
    </div>
    <span class="cost">{supplyTroop * 30}</span>
  </div>

  <span class="whole_cost"
    >{swordmen * 50 +
      archers * 65 +
      shieldBearers * 80 +
      lancers * 105 +
      supplyTroop * 30}</span
  >
  <FooterBtn agreeTitle="창설" cancelTitle="취소" />
</form>

<style>
  .muster_form {
    width: 85%;
    height: 25.8em;
    display: flex;
    flex-direction: column;
  }

  .unit_name_container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1em;
    margin-bottom: 2em;
  }

  .unit_name_icon {
    height: 70%;
    aspect-ratio: 1;
    background-image: url("/assets/img/fac_2.png");
    background-repeat: no-repeat;
    background-size: contain;
  }

  .input_col {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 0.2em 0em;
  }

  .cost {
    color: rgb(136, 93, 36);
    font-size: 0.8em;
    margin-right: 0.2em;
  }

  .input_row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5em;
  }

  label {
    height: 100%;
    font-size: 0.8em;
    font-weight: 700;
    color: rgb(136, 93, 36);
    display: flex;
    align-items: center;
    gap: 0em 0.2em;
  }

  input {
    width: 8em;
    border-width: 0;
    background-color: rgb(45, 30, 11);
    background-image: url("/assets/img/coin_form.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    font-size: 0.8em;
    font-weight: 600;
    color: rgb(152, 84, 56);
    border-radius: 0.1em;
    padding: 0.3em 0.5em;
  }

  input:focus {
    outline: none;
  }

  .whole_cost {
    color: rgb(136, 93, 36);
    margin-top: 2em;
    align-self: flex-end;
    font-size: 0.9em;
    font-weight: bold;
  }
</style>
