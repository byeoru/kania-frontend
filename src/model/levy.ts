import type {
  LevyAffiliationType,
  RealmLeviesResponseType,
} from "./realm_member";
import type { ApiResponseType } from "./response";

export type LevyRequestType = {
  name: string;
  encampment: number;
  swordmen: number;
  shield_bearers: number;
  archers: number;
  lancers: number;
  supply_troop: number;
};

export type LevyType = {
  levy_id: number;
  name: string;
  encampment: number;
  swordmen: number;
  shield_bearers: number;
  archers: number;
  lancers: number;
  supply_troop: number;
  movement_speed: number;
  stationed: boolean;
};

export interface LevyResponseType extends ApiResponseType {
  levy: LevyType;
  state_coffers: number;
  population: number;
  levy_affiliation: LevyAffiliationType;
}
export interface FindLevyResponseType extends ApiResponseType {
  realm_levy: RealmLeviesResponseType;
}

export interface FindSectorLeviesResponseType extends ApiResponseType {
  realm_levies: RealmLeviesResponseType[];
}
