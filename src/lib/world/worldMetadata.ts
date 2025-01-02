import { json, quadtree, type BaseType, type Selection } from "d3";
import type { PackCellsType } from "../../dataTypes/packCellsType";
import type { GridCellsType } from "../../dataTypes/gridCellsType";
import {
  BlurFilter,
  Container,
  Graphics,
  type ContainerChild,
  type PointData,
} from "pixi.js";

export const worldMetadata = {
  pack: {} as PackCellsType | null,
  grid: {} as GridCellsType | null,
  mapWidth: 7680,
  mapHeight: 4320,
  provinceCells: {} as { [key: number]: Array<number> },
  mapLayerStage: null as Container<ContainerChild> | null,
  // PixiJS Graphics 객체 생성
  cellGraphics: new Graphics(), // 셀 경계선용 그래픽 객체
  tempProvinceFillGraphics: new Graphics(), // 선택한 주 색칠용 그래픽 객체
  tempSectorFillGraphics: new Graphics(), // 선택한 셀 색칠용 그래픽 객체
  realmGraphics: new Graphics(), // 영토 색칠용 그래픽 객체

  async loadMetadata() {
    this.pack = (await json("assets/data/pack.json")) ?? null;
    this.grid = (await json("assets/data/grid.json")) ?? null;
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

  findProvince(cellId: number) {
    if (!this.pack?.cells.cells?.province) return;
    return this.pack.cells.cells.province[cellId];
  },

  findCellCenter(points: PointData[]) {
    // Sum all x and y coordinates
    const sum = points.reduce(
      (acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        return acc;
      },
      { x: 0, y: 0 },
    );

    // Calculate the averages
    const xCenter = sum.x / points.length;
    const yCenter = sum.y / points.length;

    return { x: xCenter, y: yCenter };
  },

  drawDefenseUnitFlag(
    cellId: number,
    // levyId: number,
    parent: Selection<BaseType, unknown, null, undefined>,
  ) {
    const points = getPackPolygon(cellId);
    const point = this.findCellCenter(points);
    parent
      .append("use")
      .attr("href", `#defense`)
      // .attr("id", `levy_${levyId}`)
      .attr("class", "defense")
      .attr("x", point.x)
      .attr("y", point.y);
  },

  drawCapital(
    cellId: number,
    realmId: number,
    parent: Selection<BaseType, unknown, null, undefined>,
  ) {
    const points = getPackPolygon(cellId);
    const point = this.findCellCenter(points);
    parent
      .append("circle")
      .attr("id", `realm_${realmId}`)
      .attr("cx", point.x.toString())
      .attr("cy", point.y.toString())
      .attr("r", "5")
      .attr("fill", "#FFFFFF")
      .attr("stroke", "black")
      .attr("stroke-width", "2");
  },

  prepareCellsBorder() {
    const cellIds = this.pack!.cells.cells.i;
    for (const key in cellIds) {
      const province = this.findProvince(cellIds[key]);
      if (!province) continue;
      if (!this.provinceCells[province]) {
        this.provinceCells[province] = [];
      }
      this.provinceCells[province].push(Number(key));
    }
  },

  drawProvinceCellsBorder(provinceId: number) {
    const currentProvinceCells = this.provinceCells[provinceId];
    currentProvinceCells.forEach((cellId) => {
      this.drawSectorPolygon(cellId, this.cellGraphics);
    });

    this.cellGraphics.closePath();
    this.cellGraphics.stroke({
      color: 0x476600,
      width: 1,
    });
    this.mapLayerStage!.addChild(this.cellGraphics);
  },

  removeProvinceCells() {
    this.cellGraphics.clear();
  },

  fillOneCell(cellId: number, color: string) {
    const blurFilter = new BlurFilter();
    blurFilter.strength = 5; // 블러 강도를 설정 (0은 블러 없음, 값이 클수록 강한 블러)
    this.tempSectorFillGraphics.filters = [blurFilter]; // 그래픽에 필터를 적용
    this.drawSectorPolygon(cellId, this.tempSectorFillGraphics);
    this.tempSectorFillGraphics.closePath();
    this.tempSectorFillGraphics.fill({ color, alpha: 0.7 });
    this.mapLayerStage!.addChild(this.tempSectorFillGraphics);
  },

  removeOneCell() {
    this.tempSectorFillGraphics.clear();
  },

  fillRealm(cellIds: number[], color: string) {
    const blurFilter = new BlurFilter();
    blurFilter.strength = 8; // 블러 강도를 설정 (0은 블러 없음, 값이 클수록 강한 블러)
    this.realmGraphics.filters = [blurFilter]; // 그래픽에 필터를 적용
    cellIds.forEach((cellId) => {
      this.drawSectorPolygon(cellId, this.realmGraphics);
    });
    this.realmGraphics.closePath();
    this.realmGraphics.fill({ color, alpha: 0.3 });
    this.mapLayerStage!.addChild(this.realmGraphics);
  },

  removeRealm() {
    this.realmGraphics.clear();
  },

  // 주변 셀들 색칠하기
  fillStrokeNearCells(cellId: number) {
    const nearSectors = this.pack!.cells.cells.c[cellId];
    nearSectors.forEach((sectorId) => {
      this.drawSectorPolygon(sectorId, this.tempProvinceFillGraphics);
    });
    this.tempProvinceFillGraphics.closePath();
    this.tempProvinceFillGraphics.stroke({ color: "0x476600", width: 1 });
    this.tempProvinceFillGraphics.fill({ color: "0x998A00", alpha: 0.5 });
    this.mapLayerStage!.addChild(this.tempProvinceFillGraphics);
  },

  // 클릭한 주 색칠하기
  fillSelectedSectors(
    cellIds: number[],
    sectorColor: string,
    lineColor: string,
  ) {
    cellIds.forEach((cellId) => {
      this.drawSectorPolygon(cellId, this.tempProvinceFillGraphics);
    });
    this.tempProvinceFillGraphics.closePath();
    this.tempProvinceFillGraphics.fill({ color: sectorColor, alpha: 0.5 });
    this.tempProvinceFillGraphics.stroke({ color: lineColor, width: 1 });
    this.mapLayerStage!.addChild(this.tempProvinceFillGraphics);
  },

  removeSelectedSectors() {
    this.tempProvinceFillGraphics.clear();
  },

  drawSectorPolygon(cellId: number, graphic: Graphics) {
    const pointDatas = getPackPolygon(cellId);
    graphic.poly(pointDatas, true);
  },
};

// get polygon points for packed cells knowing cell id
function getPackPolygon(i: number): PointData[] {
  return worldMetadata.pack!.cells.cells.v[i].map((v) => {
    const point = worldMetadata.pack!.cells.vertices.p[v];
    return { x: point[0], y: point[1] };
  });
}
