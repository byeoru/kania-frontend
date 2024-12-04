import { json, quadtree } from "d3";
import type { PackCellsType } from "../../dataTypes/packCellsType";
import type { GridCellsType } from "../../dataTypes/gridCellsType";

export const worldMetadata = {
  pack: {} as PackCellsType | null,
  grid: {} as GridCellsType | null,

  async loadMetadata() {
    this.pack = (await json("src/assets/data/kania-packcells.json")) ?? null;
    this.grid = (await json("src/assets/data/kania-gridcells.json")) ?? null;
  },

  createQuadtree() {
    this.pack!.cells.cells.q = quadtree(
      this.pack!.cells.cells.p.map(([x, y], i) => [x, y, i]),
    );
  },

  findCell(x: number, y: number, radius = Infinity) {
    if (!this.pack?.cells.cells?.q) return;

    const found = this.pack!.cells.cells.q.find(x, y, radius);
    return found ? found[2] : undefined;
  },
};
