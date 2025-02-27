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
import type { LevyActionResponseType } from "../model/levy_action";

export let showModal = writable<boolean>(false);
let mapInteractionMode = $state<GameModeType>("NORMAL");
let myRealmIdStored = new SvelteSet<number>();
let myRmId = $state<number>();
export let sectorRealmMapStored = new Map<SectorIdType, RealmIdType>();
export let realmInfoMapStored = new Map<RealmIdType, RealmFeatureType>();
export const myRealmPopulationStored = new SvelteMap<number, number>();
let wsClient: WebSocketClient | undefined;
export let modalTitle: string = "";
export let modalContent: Component | undefined;
export let modalProps: {} | undefined = {};
export let internalAffairs: InternalAffairsType = {};
let standardWorldTime: Date | undefined = undefined;
let standardRealTime: Date | undefined = undefined;
let worldTime = $state<Date>();
export const ourSectorLeviesStored = new SvelteMap<
  CellNumberType,
  Map<number, LeviesStoredType>
>();
export const ourRealmLevyActionsStored = new SvelteMap<
  number,
  LevyActionResponseType
>();

export let attackLevyInfoStored: AttackLevyInfoType | null = null;

export const getMyRmId = () => {
  return myRmId;
};

export const setMyRmId = (rmId: number) => {
  myRmId = rmId;
};

export const initWebSocketClient = (url: string) => {
  wsClient = new WebSocketClient(url);
};

export const isMyRealmId = (realmId: RealmIdType | undefined) => {
  if (!realmId) {
    return false;
  }
  if (myRealmIdStored.has(realmId)) {
    return true;
  }
  return false;
};

export const isMySector = (sectorNumber: number) => {
  const realmId = sectorRealmMapStored.get(sectorNumber);
  return realmId && isMyRealmId(realmId);
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

export function storeCellLevies(realmLevies: RealmLeviesResponseType[]) {
  realmLevies.forEach((levy) => {
    const { levy_affiliation, levies } = levy;
    levies.forEach((levy) => {
      if (ourSectorLeviesStored.has(levy.encampment)) {
        const levies = ourSectorLeviesStored.get(levy.encampment)!;
        levies.set(levy.levy_id, {
          levyAffiliation: {
            rm_id: levy_affiliation.rm_id,
            realm_id: levy_affiliation.realm_id,
          },
          levy,
        });
        ourSectorLeviesStored.set(levy.encampment, levies);
      } else {
        ourSectorLeviesStored.set(
          levy.encampment,
          new Map<number, LeviesStoredType>([
            [levy.levy_id, { levy, levyAffiliation: levy_affiliation }],
          ]),
        );
      }
    });
  });
}

export const storeLevyActions = (actions: LevyActionResponseType[]) => {
  actions.forEach((action) => {
    ourRealmLevyActionsStored.set(action.levy_action_id, action);
  });
};

export function getMapInteractionMode() {
  return mapInteractionMode;
}

export function setMapInteractionMode(mode: GameModeType) {
  mapInteractionMode = mode;
}
