export interface GridCellsType {
  readonly info: Info;
  readonly cells: Cells;
}

export interface Cells {
  readonly spacing: number;
  readonly cellsDesired: number;
  readonly boundary: Array<number[]>;
  readonly points: Array<number[]>;
  readonly cellsX: number;
  readonly cellsY: number;
  readonly cells: CellsCells;
  readonly vertices: Vertices;
  readonly seed: string;
  readonly features: FeatureElement[];
}

export interface CellsCells {
  readonly v: Array<number[]>;
  readonly c: Array<number[]>;
  readonly b: number[];
  readonly i: { [key: string]: number };
  readonly f: { [key: string]: number };
  readonly t: { [key: string]: number };
  readonly temp: { [key: string]: number };
  readonly prec: { [key: string]: number };
  readonly h: { [key: string]: number };
}

export type FeatureElement = FeatureClass | number;

export interface FeatureClass {
  readonly i: number;
  readonly land: boolean;
  readonly border: boolean;
  readonly type: Type;
}

export type Type = "ocean" | "island" | "lake";

export interface Vertices {
  readonly p: Array<number[]>;
  readonly v: Array<number[]>;
  readonly c: Array<number[]>;
}

export interface Info {
  readonly version: string;
  readonly description: string;
  readonly exportedAt: Date;
  readonly mapName: string;
  readonly width: number;
  readonly height: number;
  readonly seed: string;
  readonly mapId: number;
}
