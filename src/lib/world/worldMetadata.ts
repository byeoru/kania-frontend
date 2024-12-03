import { json } from "d3";
import type { PackCellsType } from "../../dataTypes/packCellsType";
import type { GridCellsType } from "../../dataTypes/gridCellsType";

export const worldMetadata = {
  pack: {} as PackCellsType | null,
  grid: {} as GridCellsType | null,

  async loadMetadata() {
    this.pack =
      (await json<PackCellsType>("src/assets/data/kania-packcells.json")) ??
      null;
    this.grid =
      (await json<GridCellsType>("src/assets/data/kania-gridcells.json")) ??
      null;
  },
};
