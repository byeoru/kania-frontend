import { json, quadtree, type Selection } from "d3";
import type { PackCellsType } from "../../dataTypes/packCellsType";
import type { GridCellsType } from "../../dataTypes/gridCellsType";

export const worldMetadata = {
  pack: {} as PackCellsType | null,
  grid: {} as GridCellsType | null,
  cellsBorder: "",

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

  prepareCellsBorder() {
    const data = this.pack!.cells.cells.i;
    const polygon = getPackPolygon;
    let path = "";
    for (const key in data) {
      path += "M" + polygon(data[key]);
    }
    this.cellsBorder = path;
  },

  drawCells(cellsLayer: Selection<SVGGElement, unknown, HTMLElement, any>) {
    cellsLayer.append("path").attr("d", this.cellsBorder);
  },

  removeCells(cellsLayer: Selection<SVGGElement, unknown, HTMLElement, any>) {
    cellsLayer.selectAll("path").remove();
  },
};

// get polygon points for packed cells knowing cell id
function getPackPolygon(i: number) {
  return worldMetadata.pack!.cells.cells.v[i].map(
    (v) => worldMetadata.pack!.cells.vertices.p[v],
  );
}
