import { writable } from "svelte/store";
import { SvelteMap } from "svelte/reactivity";
import {
  type AttackLevyInfoType,
  type CellNumberType,
  type GameModeType,
} from "../dataTypes/aboutUiType";
import type {
  InternalAffairsType,
  RealmFeatureType,
  RealmIdType,
  SectorIdType,
} from "../model/realm";
import type { Component } from "svelte";
import type {
  RealmMemberIDsType,
  RealmMembersResponseType,
} from "../model/realm_member";
import type { LevyType } from "../model/levy";

export let showModal = writable<boolean>(false);
let mapInteractionMode = $state<GameModeType>("NORMAL");
export let myRealmIdStored = writable<number | undefined>(undefined);
export let sectorRealmMapStored = new Map<SectorIdType, RealmIdType>();
export let realmInfoMapStored = new Map<RealmIdType, RealmFeatureType>();
export let myRealmPopulationStored = new SvelteMap<number, number>();
export const ws = new WebSocket("ws://localhost:8081");
export let modalTitle: string = "";
export let modalContent: Component | undefined;
export let modalProps: {} | undefined = {};
export let internalAffairs: InternalAffairsType = {};
let worldTime = $state<string>();
export let myRealmLeviesStored = new SvelteMap<
  CellNumberType,
  { realmMemberId: RealmMemberIDsType; levy: LevyType }[]
>();
export let attackLevyInfo: AttackLevyInfoType | null = null;

export function setAttackLevyInfo(realmMemberId: AttackLevyInfoType | null) {
  attackLevyInfo = realmMemberId;
}

export function setModalTitle(title: string) {
  modalTitle = title;
}

export function setModalContent(content: any) {
  modalContent = content;
}

export function setModalProps(props?: {}) {
  modalProps = props;
}

export function getWorldTime() {
  return worldTime;
}

export function setWorldTime(time: string) {
  worldTime = time;
}

export function storeCellLevies(realmMembers: RealmMembersResponseType[]) {
  realmMembers.forEach((member) => {
    const { realm_member, levies } = member;
    levies.forEach((levy) => {
      if (myRealmLeviesStored.has(levy.encampment)) {
        myRealmLeviesStored.get(levy.encampment)!.push({
          realmMemberId: {
            user_id: realm_member.user_id,
            realm_id: realm_member.realm_id,
          },
          levy,
        });
      } else {
        myRealmLeviesStored.set(levy.encampment, [
          {
            realmMemberId: realm_member,
            levy,
          },
        ]);
      }
    });
  });
}

export function getMapInteractionMode() {
  return mapInteractionMode;
}

export function setMapInteractionMode(mode: GameModeType) {
  mapInteractionMode = mode;
}
