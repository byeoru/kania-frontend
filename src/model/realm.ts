import type { ApiResponseType } from "./response";

type RealmType = {
  id: number;
  name: string;
  owner_id: number;
  owner_nickname: string;
  capital_number: number;
  political_entity: string;
  color: string;
  realm_cells_json: {
    RawMessage: {
      cells: number[];
    };
    Valid: boolean;
  };
};

export type SectorIdType = number;
export type RealmIdType = number;

export type RealmFeatureType = {
  id: RealmIdType;
  name: string;
  owner_id: number;
  owner_nickname: string;
  capital_number: number;
  political_entity: string;
  color: string;
};

export type RealmsStoredType = {
  myRealmId?: number;
  sectorRealmMap: Map<SectorIdType, RealmIdType>;
  realmInfoMap: Map<RealmIdType, RealmFeatureType>;
};

export interface GetMyRealmResponseType extends ApiResponseType {
  realm: RealmType;
}

export interface GetMeAndOthersReamsType extends ApiResponseType {
  my_realm: RealmType;
  the_others_realms: RealmType[];
}

export type EstablishRealmRequestType = {
  name: string;
  cell_number: number;
  province_number: number;
  realm_color: string;
};

export interface EstablishRealmResponseType extends ApiResponseType {
  ream_id: number;
}
