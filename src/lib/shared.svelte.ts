import { writable } from "svelte/store";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import {
  type AttackLevyInfoType,
  type CellNumberType,
  type GameModeType,
  type LeviesStoredType,
} from "../dataTypes/aboutUiType";
import type {
  InternalAffairsType,
  RealmFeatureType,
  RealmIdType,
  SectorIdType,
} from "../model/realm";
import type { Component } from "svelte";
import WebSocketClient from "./websocket";
import type { RealmLeviesResponseType } from "../model/realm_member";

export let showModal = writable<boolean>(false);
let mapInteractionMode = $state<GameModeType>("NORMAL");
let myRealmIdStored = new SvelteSet<number>();
export let sectorRealmMapStored = new Map<SectorIdType, RealmIdType>();
export let realmInfoMapStored = new Map<RealmIdType, RealmFeatureType>();
export let myRealmPopulationStored = new SvelteMap<number, number>();
const wsClient = new WebSocketClient("ws://localhost:8081");
export let modalTitle: string = "";
export let modalContent: Component | undefined;
export let modalProps: {} | undefined = {};
export let internalAffairs: InternalAffairsType = {};
let standardWorldTime: Date | undefined = undefined;
let standardRealTime: Date | undefined = undefined;
let worldTime = $state<Date>();
export let myRealmLeviesStored = new SvelteMap<
  CellNumberType,
  LeviesStoredType[]
>();
export let attackLevyInfoStored: AttackLevyInfoType | null = null;

export const isMyRealmId = (realmId: RealmIdType | undefined) => {
  if (!realmId) {
    return false;
  }
  if (myRealmIdStored.has(realmId)) {
    return true;
  }
  return false;
};

export const getMyRealmIdCount = () => {
  return myRealmIdStored.size;
};

export const addMyRealmId = (realmId: RealmIdType) => {
  myRealmIdStored.add(realmId);
};

export const getWebsocketClient = () => {
  return wsClient;
};

export function setAttackLevyInfo(attackLevyInfo: AttackLevyInfoType | null) {
  attackLevyInfoStored = attackLevyInfo;
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

export const initStandardRealTime = (time: Date) => {
  standardRealTime = new Date(time);
};

export const initStandardWorldTime = (time: Date) => {
  standardWorldTime = new Date(time);
};

export const updateWorldTime = () => {
  if (standardRealTime && standardWorldTime) {
    const currentRealTime = new Date();
    const realElapsedMilliseconds =
      currentRealTime.getTime() - standardRealTime.getTime();
    const acceleratedMilliseconds = realElapsedMilliseconds * 60;
    worldTime = new Date(standardWorldTime.getTime() + acceleratedMilliseconds);
  }
};

export const getWorldTime = () => {
  return worldTime;
};

export function storeCellLevies(realmMembers: RealmLeviesResponseType[]) {
  realmMembers.forEach((member) => {
    const { levy_affiliation, levies } = member;
    levies.forEach((levy) => {
      if (myRealmLeviesStored.has(levy.encampment)) {
        const levies = myRealmLeviesStored.get(levy.encampment)!;
        levies.push({
          levyAffiliation: {
            rm_id: levy_affiliation.rm_id,
            realm_id: levy_affiliation.realm_id,
          },
          levy,
        });
        myRealmLeviesStored.set(levy.encampment, levies);
      } else {
        myRealmLeviesStored.set(levy.encampment, [
          {
            levyAffiliation: levy_affiliation,
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

export const getExactWorldTime = async () => {
  const ws = getWebsocketClient();
  const res = await ws.sendRequest({ title: "worldTime" });
  // Base64 디코딩
  const decodedDate = atob(res.body);
  return new Date(decodedDate);
};
