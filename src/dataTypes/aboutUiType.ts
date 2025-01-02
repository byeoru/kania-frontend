import type { RealmMemberIDsType } from "../model/realm_member";

export type CurrentCellInfoType = {
  x: number;
  y: number;
  i: number;
  type: string;
  provinceId?: number;
  population: number;
  elevation: number;
  biome: string;
};

export type GameModeType = "NORMAL" | "CELL_SELECTION" | "ATTACK" | "MOVE";

export type CellNumberType = number;

export interface AttackLevyInfoType extends RealmMemberIDsType {
  encampment: number;
}
