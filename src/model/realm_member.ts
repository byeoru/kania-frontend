import type { LevyType } from "./levy";
import type { MyRealmType, RealmType } from "./realm";
import type { ApiResponseType } from "./response";

export type StandardTimesType = {
  standard_real_time: Date;
  standard_world_time: Date;
};

export interface GetMeAndOthersReamsResponseType extends ApiResponseType {
  standard_times: StandardTimesType;
  my_realm: MyRealmType | null;
  the_others_realms: RealmType[];
}

export interface GetOurRealmLeviesResponseType extends ApiResponseType {
  realm_levies: RealmLeviesResponseType[];
}

export type RealmLeviesResponseType = {
  levy_affiliation: LevyAffiliationType;
  levies: LevyType[];
};

export type LevyAffiliationType = {
  rm_id: number;
  realm_id: number;
};
