<script lang="ts">
  import { HttpStatusCode } from "axios";
  import { levyActionApi } from "../../api/levy_action";
  import FooterBtn from "./FooterBtn.svelte";
  import {
    attackLevyInfoStored,
    ourSectorLeviesStored,
    setMapInteractionMode,
    showModal,
    storeLevyActions,
  } from "../../../shared.svelte";
  import { getPackPolygon, worldMetadata } from "../../worldMetadata";
  import {
    calculateDistance,
    calculateDurationHours,
    convertHoursToDaysHoursMinutes,
  } from "../../../../utils";

  let {
    levyId,
    attackActionData,
  }: {
    levyId: number;
    attackActionData: {
      originSector: number;
      targetSector: number;
    };
  } = $props();
  const originCenter = worldMetadata.findCellCenter(
    getPackPolygon(attackActionData.originSector),
  );
  const targetCenter = worldMetadata.findCellCenter(
    getPackPolygon(attackActionData.targetSector),
  );
  const distance = calculateDistance(originCenter, targetCenter);
  const deltaHours = calculateDurationHours(
    distance,
    attackLevyInfoStored!.speed,
  );
  const { days, hours, minutes } = convertHoursToDaysHoursMinutes(deltaHours);
  const formattedDuration =
    `${days > 0 ? `${days}일` : ""}` +
    `${hours > 0 ? `${hours}시간` : ""}` +
    `${minutes}분`;
</script>

<form
  class="attack_form"
  onsubmit={async (event: SubmitEvent) => {
    event.preventDefault();
    const res = await levyActionApi.advance(
      {
        origin_sector: attackActionData.originSector,
        target_sector: attackActionData.targetSector,
      },
      levyId,
    );

    switch (res.status) {
      case HttpStatusCode.Ok:
        $showModal = false;
        setMapInteractionMode("NORMAL");

        worldMetadata.drawActionRoad(
          res.data.levy_action.levy_action_id,
          "Attack",
          attackActionData.originSector,
          attackActionData.targetSector,
        );

        worldMetadata.drawAttackLogo(
          attackActionData.targetSector,
          res.data.levy_action.levy_action_id,
        );

        const sectorLevies = ourSectorLeviesStored.get(
          attackActionData.originSector,
        );
        const attackerLevy = sectorLevies?.get(levyId);
        if (sectorLevies && attackerLevy) {
          sectorLevies?.set(levyId, {
            levyAffiliation: attackerLevy.levyAffiliation,
            levy: { ...attackerLevy.levy, stationed: false },
          });
          ourSectorLeviesStored.delete(attackActionData.originSector);
          ourSectorLeviesStored.set(
            attackActionData.originSector,
            sectorLevies,
          );
        }

        // action store에 추가
        storeLevyActions([res.data.levy_action]);
        break;
      case HttpStatusCode.BadRequest:
        alert("공격이 실패했습니다.");
        break;
      case HttpStatusCode.InternalServerError:
        alert("서버 오류가 발생했습니다.");
        break;
    }
  }}
>
  <section class="advance_info">
    <div class="levy_speed section_item">
      <span class="title">진군 속도</span>
      <span class="content">{attackLevyInfoStored!.speed.toFixed(1)}km/h</span>
    </div>
    <div class="distance section_item">
      <span class="title">이동 거리</span>
      <span class="content">{distance.toFixed(1)}km</span>
    </div>
    <div class="duration section_item">
      <span class="title">소요 시간</span>
      <span class="content">약 {formattedDuration}</span>
    </div>
  </section>
  <FooterBtn agreeTitle="확인" cancelTitle="취소" />
</form>

<style>
  .attack_form {
    width: 85%;
    height: 25.8em;
    display: flex;
    flex-direction: column;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 0.7em 0em;
    padding-top: 1em;
  }
  .section_item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8em;
  }
  .section_item .title {
    color: rgb(136, 93, 36);
    font-weight: 700;
  }
  .section_item .content {
    color: rgb(152, 84, 56);
    font-weight: 600;
  }
</style>
