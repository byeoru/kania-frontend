<script lang="ts">
  import type { LevyType } from "../../../model/levy";
  import type { RealmMemberIDsType } from "../../../model/realm_member";
  import {
    setAttackLevyInfo,
    setMapInteractionMode,
  } from "../../shared.svelte";

  let {
    realmMemberId,
    levy,
  }: {
    realmMemberId: RealmMemberIDsType;
    levy: LevyType;
  } = $props();

  function onAttackClick() {
    setAttackLevyInfo({
      user_id: realmMemberId.user_id,
      realm_id: realmMemberId.realm_id,
      encampment: levy.encampment,
    });
    setMapInteractionMode("ATTACK");
  }
</script>

<div class="levy_container">
  <div class="levy">
    <div class="unit_name_container">
      <span class="unit_status_icon"></span>
      <span class="unit_name">{levy.name}</span>
    </div>
    <div class="unit_info">
      <section>
        <span class="unit_type">검병</span>
        <span class="count">{levy.swordmen}</span>
      </section>
      <section>
        <span class="unit_type">궁병</span>
        <span class="count">{levy.archers}</span>
      </section>
      <section>
        <span class="unit_type">방패병</span>
        <span class="count">{levy.shield_bearers}</span>
      </section>
      <section>
        <span class="unit_type">창기병</span>
        <span class="count">{levy.lancers}</span>
      </section>
      <section>
        <span class="unit_type">보급병</span>
        <span class="count">{levy.supply_troop}</span>
      </section>
    </div>
  </div>
  <section class="levy_actions">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button onclick={onAttackClick}>
      <div class="attack_mode_icon"></div>
    </button>
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button>
      <div class="move_mode_icon"></div>
    </button>
  </section>
</div>

<style>
  .levy_container {
    width: 100%;
    display: flex;
    gap: 0em 0.1em;
  }
  .levy_actions {
    width: 1.7em;
    height: 100%;
  }
  .levy_actions button {
    width: 100%;
    aspect-ratio: 1;
    background-image: url("/assets/img/fq_normal.png");
    background-size: 100% 100%;
    padding: 0em;
  }
  .levy_actions button:focus {
    outline: none;
  }
  .attack_mode_icon {
    width: 100%;
    height: 100%;
    background-image: url("/assets/img/melee_3.png");
    background-size: 100% 100%;
  }
  .move_mode_icon {
    width: 100%;
    height: 100%;
    background-image: url("/assets/img/archer_4.png");
    background-size: 100% 100%;
  }
  .levy {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .unit_status_icon {
    height: 100%;
    aspect-ratio: 1;
    background-image: url("/assets/img/defense_ribbon_h.png");
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-position: center;
    margin-left: 0.3em;
  }
  .unit_name_container {
    width: 100%;
    height: 1.5em;
    background-image: url("/assets/img/optiontab_p.png");
    background-size: 100% 100%;
    display: flex;
    align-items: center;
  }
  .unit_name {
    font-size: 0.8em;
    font-weight: 500;
    color: rgb(136, 93, 36);
    margin-left: 0.3em;
    white-space: nowrap;
    line-clamp: 1;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .unit_info {
    background-image: url("/assets/img/tooltip_1.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    padding: 0.7em;
    gap: 0.2em 0em;
  }
  .unit_info section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .unit_type {
    font-size: 0.8em;
    font-weight: 500;
    color: rgb(136, 93, 36);
  }
  .count {
    font-size: 0.8em;
    font-weight: 500;
    color: rgb(200, 185, 166);
  }
</style>
