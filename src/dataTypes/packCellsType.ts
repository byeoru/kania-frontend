export interface PackCellsType {
  readonly info: Info;
  readonly cells: Cells;
}

export interface Cells {
  readonly vertices: Vertices;
  readonly cells: CellsCells;
  readonly features: FeatureElement[];
  readonly rivers: River[];
  readonly cultures: Culture[];
  readonly burgs: Burg[];
  readonly states: State[];
  readonly routes: Route[];
  readonly religions: Religion[];
  readonly provinces: ProvinceElement[];
  readonly markers: Marker[];
}

export interface Burg {
  readonly cell?: number;
  readonly x?: number;
  readonly y?: number;
  readonly state?: number;
  readonly i?: number;
  readonly culture?: number;
  readonly name?: string;
  readonly feature?: number;
  readonly capital?: number;
  readonly port?: number;
  readonly population?: number;
  readonly type?: BurgType;
  readonly coa?: BurgCoa;
  readonly citadel?: number;
  readonly plaza?: number;
  readonly walls?: number;
  readonly shanty?: number;
  readonly temple?: number;
}

export interface BurgCoa {
  readonly t1: string;
  readonly division?: DivisionClass;
  readonly charges?: PurpleCharge[];
  readonly shield: Shield;
  readonly ordinaries?: Ordinary[];
}

export interface PurpleCharge {
  readonly charge: string;
  readonly t: T1;
  readonly p: string;
  readonly size: number;
  readonly t2?: T1;
  readonly t3?: T1;
  readonly divided?: Divided;
  readonly reversed?: number;
  readonly sinister?: number;
}

export type Divided = "counter" | "field";

export type T1 =
  | "vert"
  | "argent"
  | "purpure"
  | "sable"
  | "gules"
  | "or"
  | "azure";

export interface DivisionClass {
  readonly division: DivisionEnum;
  readonly t: string;
  readonly line?: string;
}

export type DivisionEnum =
  | "perCross"
  | "perSaltire"
  | "perChevron"
  | "perBend"
  | "gyronny"
  | "perPale"
  | "perFess"
  | "chevronny"
  | "perBendSinister"
  | "perPile"
  | "perChevronReversed";

export interface Ordinary {
  readonly ordinary: string;
  readonly t: T1;
  readonly line?: string;
  readonly divided?: Divided;
}

export type Shield =
  | "fantasy1"
  | "urukHai"
  | "oldFrench"
  | "moriaOrc"
  | "heater"
  | "erebor"
  | "round";

export type BurgType =
  | "Generic"
  | "Lake"
  | "Naval"
  | "Hunting"
  | "Highland"
  | "Nomadic";

export interface CellsCells {
  readonly v: Array<number[]>;
  readonly c: Array<number[]>;
  readonly b: number[];
  readonly i: { [key: string]: number };
  readonly p: Array<number[]>;
  readonly g: { [key: string]: number };
  readonly q: Q;
  readonly h: { [key: string]: number };
  readonly area: { [key: string]: number };
  readonly f: { [key: string]: number };
  readonly t: { [key: string]: number };
  readonly haven: { [key: string]: number };
  readonly harbor: { [key: string]: number };
  readonly fl: { [key: string]: number };
  readonly r: { [key: string]: number };
  readonly conf: { [key: string]: number };
  readonly biome: { [key: string]: number };
  readonly s: { [key: string]: number };
  readonly pop: { [key: string]: number };
  readonly culture: { [key: string]: number };
  readonly burg: { [key: string]: number };
  readonly state: { [key: string]: number };
  readonly routes: { [key: string]: { [key: string]: number } };
  readonly religion: { [key: string]: number };
  readonly province: { [key: string]: number };
}

export interface Q {
  readonly _x0: number;
  readonly _y0: number;
  readonly _x1: number;
  readonly _y1: number;
  readonly _root: ((QRoot[] | null)[] | null)[];
}

export type QRoot = PurpleRoot[] | RootClass | null;

export type PurpleRoot = FluffyRoot[] | RootClass | null;

export type FluffyRoot = TentacledRoot[] | RootClass | null;

export type TentacledRoot = StickyRoot[] | RootClass | null;

export type StickyRoot = IndigoRoot[] | RootClass | null;

export type IndigoRoot = IndecentRoot[] | RootClass | null;

export type IndecentRoot = HilariousRoot[] | RootClass | null;

export type HilariousRoot = AmbitiousRoot[] | RootClass | null;

export type AmbitiousRoot = CunningRoot[] | RootClass | null;

export type CunningRoot = (RootClass | null)[] | RootClass | null;

export interface RootClass {
  readonly data: number[];
}

export interface Culture {
  readonly name: string;
  readonly i: number;
  readonly base: number;
  readonly origins: (number | null)[];
  readonly shield: Shield;
  readonly center?: number;
  readonly color?: string;
  readonly type?: BurgType;
  readonly expansionism?: number;
  readonly code?: string;
}

export type FeatureElement = FeatureClass | number;

export interface FeatureClass {
  readonly i: number;
  readonly land: boolean;
  readonly border: boolean;
  readonly type: FeatureType;
  readonly cells: number;
  readonly firstCell: number;
  readonly group: FeatureGroup;
  readonly area?: number;
  readonly vertices?: number[];
  readonly shoreline?: number[];
  readonly height?: number;
  readonly flux?: number;
  readonly temp?: number;
  readonly evaporation?: number;
  readonly inlets?: number[];
  readonly outlet?: number;
  readonly name?: string;
}

export type FeatureGroup =
  | "ocean"
  | "isle"
  | "island"
  | "continent"
  | "freshwater"
  | "lava";

export type FeatureType = "ocean" | "island" | "lake";

export interface Marker {
  readonly icon: string;
  readonly type: string;
  readonly dx?: number;
  readonly px?: number;
  readonly x: number;
  readonly y: number;
  readonly cell: number;
  readonly i: number;
  readonly dy?: number;
}

export type ProvinceElement = ProvinceClass | number;

export interface ProvinceClass {
  readonly i: number;
  readonly state: number;
  readonly center: number;
  readonly burg: number;
  readonly name: string;
  readonly formName: FormName;
  readonly fullName: string;
  readonly color: string;
  readonly coa: BurgCoa;
  readonly pole: number[];
}

export type FormName =
  | "Margrave"
  | "Earldom"
  | "County"
  | "Barony"
  | "Captaincy";

export interface Religion {
  readonly name: string;
  readonly i: number;
  readonly origins: number[] | null;
  readonly type?: string;
  readonly form?: string;
  readonly culture?: number;
  readonly center?: number;
  readonly deity?: null | string;
  readonly expansion?: string;
  readonly expansionism?: number;
  readonly color?: string;
  readonly code?: string;
}

export interface River {
  readonly i: number;
  readonly source: number;
  readonly mouth: number;
  readonly discharge: number;
  readonly length: number;
  readonly width: number;
  readonly widthFactor: number;
  readonly sourceWidth: number;
  readonly parent: number;
  readonly cells: number[];
  readonly basin: number;
  readonly name: string;
  readonly type: RiverType;
}

export type RiverType = "River" | "Fork" | "Creek" | "Stream" | "Brook";

export interface Route {
  readonly i: number;
  readonly group: RouteGroup;
  readonly feature: number;
  readonly points: Array<number[]>;
}

export type RouteGroup = "trails" | "searoutes";

export interface State {
  readonly i: number;
  readonly name: string;
  readonly urban: number;
  readonly rural: number;
  readonly burgs: number;
  readonly area: number;
  readonly cells: number;
  readonly neighbors: any[];
  readonly diplomacy: string[];
  readonly provinces: number[];
  readonly color?: string;
  readonly expansionism?: number;
  readonly capital?: number;
  readonly type?: BurgType;
  readonly center?: number;
  readonly culture?: number;
  readonly coa?: StateCoa;
  readonly campaigns?: Campaign[];
  readonly form?: string;
  readonly formName?: string;
  readonly fullName?: string;
  readonly pole?: number[];
  readonly alert?: number;
  readonly military?: Military[];
}

export interface Campaign {
  readonly name: string;
  readonly start: number;
  readonly end: number;
}

export interface StateCoa {
  readonly t1: T1;
  readonly ordinaries: Ordinary[];
  readonly charges: FluffyCharge[];
  readonly shield: Shield;
}

export interface FluffyCharge {
  readonly charge: string;
  readonly t: T1;
  readonly p: string;
  readonly size: number;
}

export interface Military {
  readonly i: number;
  readonly a: number;
  readonly cell: number;
  readonly x: number;
  readonly y: number;
  readonly bx: number;
  readonly by: number;
  readonly u: U;
  readonly n: number;
  readonly name: string;
  readonly state: number;
  readonly icon: string;
}

export interface U {
  readonly archers?: number;
  readonly cavalry?: number;
  readonly infantry?: number;
  readonly artillery?: number;
  readonly fleet?: number;
}

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
