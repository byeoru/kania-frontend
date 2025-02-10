import type { IndigenousUnitType } from "../model/indigenous_unit";
import type { LevyType } from "../model/levy";
import type { LevyAffiliationType } from "../model/realm_member";

export type CurrentCellInfoType = {
  x: number;
  y: number;
  i: number;
  type: FeatureType;
  provinceId?: number;
  population: number;
  elevation: number;
  biome: string;
  indigenousUnit: IndigenousUnitType | null;
};

export type GameModeType = "NORMAL" | "CELL_SELECTION" | "ATTACK" | "MOVE";

export type CellNumberType = number;

export type ActionType = "Attack" | "Move" | "Return";

export interface AttackLevyInfoType extends LevyAffiliationType {
  levyId: number;
  encampment: number;
  speed: number;
}

export type LeviesStoredType = {
  levyAffiliation: LevyAffiliationType;
  levy: LevyType;
};

export type FeatureType = "ocean" | "island" | "lake";

type PoliticalEntityStatusType = {
  politicalEntity: string;
  status: string;
};

const politicalEntityMap = new Map<string, PoliticalEntityStatusType>([
  ["Tribe", { politicalEntity: "부족국가", status: "추장" }],
  ["TribalConfederation", { politicalEntity: "부족연맹", status: "대추장" }],
  ["Kingdom", { politicalEntity: "왕국", status: "왕" }],
  ["KingdomConfederation", { politicalEntity: "왕국연맹", status: "대왕" }],
  ["Empire", { politicalEntity: "제국", status: "황제" }],
  ["FeudatoryState", { politicalEntity: "번왕국", status: "번왕" }],
  ["RestorationForces", { politicalEntity: "부흥세력", status: "장군" }],
]);

export const getPoliticalEntityKr = (
  politicalEntityEn: string,
): PoliticalEntityStatusType => {
  const bExist = politicalEntityMap.has(politicalEntityEn);
  if (!bExist) {
    return {
      politicalEntity: "없음",
      status: "없음",
    };
  }

  return politicalEntityMap.get(politicalEntityEn)!;
};
