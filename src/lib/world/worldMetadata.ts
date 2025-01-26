import {
  json,
  quadtree,
  type BaseType,
  type Selection,
  color,
  select,
} from "d3";
import type {
  FeatureClass,
  PackCellsType,
  ProvinceClass,
} from "../../dataTypes/packCellsType";
import type { GridCellsType } from "../../dataTypes/gridCellsType";
import {
  BlurFilter,
  Container,
  Graphics,
  type ContainerChild,
  type PointData,
} from "pixi.js";
import { isMyRealmId, sectorRealmMapStored } from "../shared.svelte";

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

  drawCapitals(
    cellIds: number[],
    realmId: number,
    parent: Selection<BaseType, unknown, null, undefined>,
  ) {
    for (const [index, cell] of cellIds.entries()) {
      const points = getPackPolygon(cell);
      const point = this.findCellCenter(points);
      parent
        .append("circle")
        .attr("id", `realm_${realmId}_${index}`)
        .attr("cx", point.x.toString())
        .attr("cy", point.y.toString())
        .attr("r", "5")
        .attr("fill", "#FFFFFF")
        .attr("stroke", "black")
        .attr("stroke-width", "2");
    }
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
    // blurFilter.strength = 3; // 블러 강도를 설정 (0은 블러 없음, 값이 클수록 강한 블러)
    // this.realmGraphics.filters = [blurFilter]; // 그래픽에 필터를 적용
    cellIds.forEach((cellId) => {
      this.drawSectorPolygon(cellId, this.realmGraphics);
    });
    this.realmGraphics.closePath();
    this.realmGraphics.fill({ color });
    this.mapLayerStage!.addChild(this.realmGraphics);
  },

  removeRealm() {
    this.realmGraphics.clear();
  },

  // 주변 육지 색칠하기
  fillStrokeNearLandCells(cellId: number) {
    const nearLands = this.pack!.cells.cells.c[cellId].filter((i) => {
      const feature = worldMetadata.pack!.cells.features[
        worldMetadata.pack!.cells.cells.f[i]
      ] as FeatureClass;
      return feature.land;
    });
    nearLands.forEach((sectorId) => {
      const isRealmSector = sectorRealmMapStored.has(sectorId);
      if (!isRealmSector || !isMyRealmId(sectorRealmMapStored.get(sectorId))) {
        this.drawSectorPolygon(sectorId, this.tempProvinceFillGraphics);
      }
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
    this.tempProvinceFillGraphics.fill({ color: sectorColor, alpha: 0.3 });
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

  drawProvinceBorder() {
    const { cells, vertices, features } = this.pack!.cells;
    const provinces = this.pack!.cells.provinces;
    const n = cells.i.length;

    const used = new Uint8Array(cells.i.length);
    const vArray = new Array(provinces.length); // store vertices array
    const body = new Array(provinces.length).fill(""); // path around each state
    const gap = new Array(provinces.length).fill(""); // path along water for each state to fill the gaps
    const halo = new Array(provinces.length).fill(""); // path around states, but not lakes

    const getStringPoint = (v: [number, string]) => vertices.p[v[0]].join(",");

    const getShoreline = function (lake: FeatureClass) {
      const uniqueCells = new Set<number>();
      if (!lake.vertices) lake.vertices = [];
      lake.vertices.forEach((v) =>
        vertices.c[v].forEach((c) => cells.h[c] >= 20 && uniqueCells.add(c)),
      );
      lake.shoreline = [...uniqueCells];
    };

    // define inner-province lakes to omit on border render
    const innerLakes = features.map((feature) => {
      const featureClass = feature as FeatureClass;
      if (featureClass.type !== "lake") return false;
      if (!featureClass.shoreline) getShoreline(featureClass);

      const provinces = featureClass.shoreline?.map((i) => cells.province[i]);
      return new Set(provinces).size > 1 ? false : true;
    });

    for (const i of Object.values(cells.i)) {
      if (used[i]) continue;
      const province = cells.province[i];

      // 주변 cell들의 state를 확인하여 현재 cell이 경계에 위치하는지 확인
      const onborder = cells.c[i].some((n) => cells.province[n] !== province);
      // 최외곽(경계)이 아니라면 pass
      if (!onborder) continue;

      // 최외각(경계) cell의 이웃 cell중 현재 state가 아닌(내 땅이 아닌) cell을 찾는다.
      const borderWith = cells.c[i]
        .map((c) => cells.province[c])
        .find((n) => n !== province);

      // 최외각(경계) cell의 꼭짓점들중 꼭짓점과 인접한 cell의 state가 아까 찾은 다른 state(borderWith)인 것을 찾는다.
      const vertex = cells.v[i].find((v) =>
        vertices.c[v].some((i) => cells.province[i] === borderWith),
      );

      // 찾은 꼭짓점을 현재 state에 연결한다.
      const chain = connectVertices(vertex!, province);

      // noInnerLakes === filter 된 chain
      const noInnerLakes = chain.filter((v) => v[1] !== "innerLake");

      if (noInnerLakes.length < 3) continue;

      // // get path around the province
      if (!vArray[province]) vArray[province] = [];
      // 꼭짓점들의 좌표 값을 가져온다.
      const points = noInnerLakes.map((v) => vertices.p[v[0]]);
      // 현재 state의 꼭짓점 좌표값들을 저장한다.
      vArray[province].push(points);
      // path form 형식으로 가공한다. ('M': move, 'L': Line)
      body[province] += "M" + points.join("L");
      // connect path for halo
      let discontinued = true;
      halo[province] += noInnerLakes
        .map((v) => {
          if (v[1] === "border") {
            discontinued = true;
            return "";
          }

          const operation = discontinued ? "M" : "L";
          discontinued = false;
          return `${operation}${getStringPoint(v)}`;
        })
        .join("");

      // connect gaps between province and water into a single path
      discontinued = true;
      gap[province] += chain
        .map((v) => {
          if (v[1] === "land") {
            discontinued = true;
            return "";
          }

          const operation = discontinued ? "M" : "L";
          discontinued = false;
          return `${operation}${getStringPoint(v)}`;
        })
        .join("");
    }

    // find province visual center
    // vArray.forEach((ar, i) => {
    //   const sorted = ar.sort((a, b) => b.length - a.length); // sort by points number
    //   states[i].pole = polylabel(sorted, 1.0); // pole of inaccessibility
    // });

    const bodyData = body
      .map((p, s) => [
        p.length > 10 ? p : null,
        s,
        (provinces[s] as ProvinceClass).color,
      ])
      .filter((d) => d[0]);
    const gapData = gap
      .map((p, s) => [
        p.length > 10 ? p : null,
        s,
        (provinces[s] as ProvinceClass).color,
      ])
      .filter((d) => d[0]);

    const bodyString = bodyData
      .map(
        (d) =>
          `<path id="province${d[1]}" d="${d[0]}" fill="${d[2]}" stroke="none"/>`,
      )
      .join("");
    const gapString = gapData
      .map(
        (d) =>
          `<path id="province-gap${d[1]}" d="${d[0]}" fill="none" stroke="${d[2]}"/>`,
      )
      .join("");
    select("#provincesBody").html(bodyString + gapString);

    const haloData = halo
      .map((p, s) => [
        p.length > 10 ? p : null,
        s,
        (provinces[s] as ProvinceClass).color,
      ])
      .filter((d) => d[0]);

    const haloString = haloData
      .map((d) => {
        const stroke = color(d[2]) ? color(d[2])!.darker().hex() : "#666666";
        return `<path id="province-border${d[1]}" d="${d[0]}" clip-path="url(#province-clip${d[1]})" stroke="${stroke}"/>`;
      })
      .join("");
    select("#provincesHalo").html(haloString);

    const clipString = bodyData
      .map(
        (d) =>
          `<clipPath id="province-clip${d[1]}"><use href="#province${d[1]}"/></clipPath>`,
      )
      .join("");
    select("#provincePaths").html(clipString);

    function connectVertices(
      start: number,
      province: number,
    ): [number, string][] {
      const chain: [number, string][] = []; // vertices chain to form a path
      const getType = (c: number[]) => {
        const borderCell = c.find((i: number) => cells.b[i]);
        if (borderCell) return "border";

        const waterCell = c.find((i: number) => cells.h[i] < 20);
        if (!waterCell) return "land";
        if (innerLakes[cells.f[waterCell]]) return "innerLake";
        return (features[cells.f[waterCell]] as FeatureClass).type;
      };

      for (
        let i = 0, current = start;
        i === 0 || (current !== start && i < 20000);
        i++
      ) {
        const prev = chain.length ? chain[chain.length - 1][0] : -1; // previous vertex in chain

        const c = vertices.c[current]; // cells adjacent to vertex
        chain.push([current, getType(c)]); // add current vertex to sequence

        c.filter((c) => cells.province[c] === province).forEach(
          (c) => (used[c] = 1),
        );
        const c0 = c[0] >= n || cells.province[c[0]] !== province;
        const c1 = c[1] >= n || cells.province[c[1]] !== province;
        const c2 = c[2] >= n || cells.province[c[2]] !== province;

        const v = vertices.v[current]; // neighboring vertices

        if (v[0] !== prev && c0 !== c1) current = v[0];
        else if (v[1] !== prev && c1 !== c2) current = v[1];
        else if (v[2] !== prev && c0 !== c2) current = v[2];

        if (current === prev) {
          console.error("Next vertex is not found");
          break;
        }
      }

      if (chain.length) chain.push(chain[0]);
      return chain;
    }

    // invokeActiveZooming();
  },
};

// get polygon points for packed cells knowing cell id
export function getPackPolygon(i: number): PointData[] {
  return worldMetadata.pack!.cells.cells.v[i].map((v) => {
    const point = worldMetadata.pack!.cells.vertices.p[v];
    return { x: point[0], y: point[1] };
  });
}
