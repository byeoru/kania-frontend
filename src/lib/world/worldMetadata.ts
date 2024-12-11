import { json, quadtree, type BaseType, type Selection } from "d3";
import type { PackCellsType } from "../../dataTypes/packCellsType";
import type { GridCellsType } from "../../dataTypes/gridCellsType";

export const worldMetadata = {
  pack: {} as PackCellsType | null,
  grid: {} as GridCellsType | null,
  mapWidth: 1440,
  mapHeight: 812,
  cellsBorder: {} as { [key: number]: string },
  cellsLayer: {} as Selection<SVGGElement, unknown, HTMLElement, any>,

  async loadMetadata() {
    this.pack = (await json("src/assets/data/kania-packcells.json")) ?? null;
    this.grid = (await json("src/assets/data/kania-gridcells.json")) ?? null;
  },

  createQuadtree() {
    this.pack!.cells.cells.q = quadtree(
      this.pack!.cells.cells.p.map(([x, y], i) => [x, y, i]),
    );
  },

  setCellsLayerAttr(viewBox: Selection<BaseType, unknown, HTMLElement, any>) {
    this.cellsLayer = viewBox
      .append("g")
      .attr("id", "cells")
      // .attr("stroke", "#808080")
      .attr("stroke", "#872600")
      .attr("stroke-width", 0.05)
      .style("fill", "none");
  },

  findCell(x: number, y: number, radius = Infinity) {
    if (!this.pack?.cells.cells?.q) return;

    const found = this.pack!.cells.cells.q.find(x, y, radius);
    return found ? found[2] : undefined;
  },

  findProvince(cellId: number) {
    if (!this.pack?.cells.cells?.province) return;
    return this.pack.cells.cells.province[cellId];
  },

  prepareCellsBorder() {
    const cellIds = this.pack!.cells.cells.i;
    const polygon = getPackPolygon;
    for (const key in cellIds) {
      const province = this.findProvince(cellIds[key]);
      if (!province) continue;
      if (!this.cellsBorder[province]) {
        this.cellsBorder[province] = "";
      }
      this.cellsBorder[province] += `M${polygon(cellIds[key])} `;
    }
  },

  drawCells(
    cellsLayer: Selection<SVGGElement, unknown, HTMLElement, any>,
    provinceId: number,
  ) {
    cellsLayer.append("path").attr("d", this.cellsBorder[provinceId]);
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
