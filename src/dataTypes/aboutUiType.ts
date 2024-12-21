export type CurrentCellInfoType = {
  x: number;
  y: number;
  i: number;
  type: string;
  countryName?: string;
  nickname?: string;
  political_entity?: string;
  provinceId?: number;
  population: number;
  elevation: number;
  biome: string;
};

export type MapInteractionType = "NORMAL" | "CELL_SELECTION";
