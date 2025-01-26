import type { ApiResponseType } from "./response";

export type IndigenousUnitType = {
  sector_number: number;
  swordmen: number;
  archers: number;
  lancers: number;
};

export interface GetIndigenousUnitResponseType extends ApiResponseType {
  indigenous_unit: IndigenousUnitType;
}
