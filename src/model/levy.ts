import type { RealmMemberIDsType } from "./realm_member";
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
  offensive_strength: number;
  defensive_strength: number;
};

export interface LevyResponseType extends ApiResponseType {
  levy: LevyType;
  state_coffers: number;
  realm_member_ids: RealmMemberIDsType;
}
