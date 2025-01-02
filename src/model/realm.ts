import type { ApiResponseType } from "./response";

type RealmType = {
  id: number;
  name: string;
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

interface MyRealmType extends RealmType {
  population_growth_rate: number;
  state_coffers: number;
  census_at: Date;
  tax_collection_at: Date;
}

export type SectorIdType = number;
export type RealmIdType = number;

export type RealmFeatureType = {
  id: RealmIdType;
  name: string;
  owner_nickname: string;
  capital_number: number;
  political_entity: string;
  color: string;
};

export interface GetMyRealmResponseType extends ApiResponseType {
  realm: MyRealmType;
}

export interface GetMeAndOthersReamsType extends ApiResponseType {
  my_realm: MyRealmType;
  the_others_realms: RealmType[];
}

export type EstablishRealmRequestType = {
  name: string;
  cell_number: number;
  province_number: number;
  realm_color: string;
  init_date: string;
  population: number;
};

export interface EstablishRealmResponseType extends ApiResponseType {
  my_realm: {
    id: number;
    name: string;
    owner_nickname: string;
    capital_number: number;
    political_entity: string;
    color: string;
    population_growth_rate: number;
    state_coffers: number;
    census_at: Date;
    tax_collection_at: Date;
  };
}

export type ExcuteCensusRequestType = {
  current_date: string;
};

export type InternalAffairsType = {
  populationGrowthRate?: number;
  stateCoffers?: number;
  censusAt?: Date;
  taxCollectionAt?: Date;
};
