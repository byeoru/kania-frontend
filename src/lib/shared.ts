import { writable } from "svelte/store";
import { type MapInteractionType } from "../dataTypes/aboutUiType";
import type {
  RealmFeatureType,
  RealmIdType,
  RealmsStoredType,
  SectorIdType,
} from "../model/realm";

export let showModal = writable<boolean>(false);
export let mapInteractionMode = writable<MapInteractionType>("NORMAL");
export const realmsStored: RealmsStoredType = {
  sectorRealmMap: new Map<SectorIdType, RealmIdType>(),
  realmInfoMap: new Map<RealmIdType, RealmFeatureType>(),
} as RealmsStoredType;
