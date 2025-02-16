import {
  easeLinear,
  json,
  quadtree,
  select,
  text,
  xml,
  type BaseType,
  type Selection,
} from "d3";
import type {
  FeatureClass,
  PackCellsType,
} from "../../dataTypes/packCellsType";
import type { GridCellsType } from "../../dataTypes/gridCellsType";
import {
  Application,
  BlurFilter,
  Container,
  Graphics,
  Sprite,
  Texture,
  TextureSource,
  type ContainerChild,
  type PointData,
  type Renderer,
} from "pixi.js";
import {
  isMyRealmId,
  ourRealmLevyActionsStored,
  ourSectorLeviesStored,
  realmInfoMapStored,
  sectorRealmMapStored,
  storeCellLevies,
} from "../shared.svelte";
import { type SectorIdType } from "../../model/realm";
import type { UpdateSectorBodyType } from "../../model/ws";
import { levyApi } from "./api/levy";
import { HttpStatusCode } from "axios";
import type { LevyActionResponseType } from "../../model/levy_action";
import type { ActionType, LeviesStoredType } from "../../dataTypes/aboutUiType";
import { actionRoadColor, oceanPattern } from "../../constant";
import parse from "parse-svg-path";
import { DropShadowFilter } from "pixi-filters";

export const worldMetadata = {
  pack: {} as PackCellsType | null,
  grid: {} as GridCellsType | null,
  mapWidth: 7680,
  mapHeight: 4320,
  pixiApp: null as Application<Renderer> | null,
  provinceCells: new Map<number, number[]>(),
  realmCells: new Map<number, Set<number>>(),
  mapLayerStage: null as Container<ContainerChild> | null,
  // PixiJS Graphics 객체 생성
  cellGraphics: new Graphics(), // 셀 경계선용 그래픽 객체
  tempProvinceFillGraphics: new Graphics(), // 선택한 주 색칠용 그래픽 객체
  tempSectorFillGraphics: new Graphics(), // 선택한 셀 색칠용 그래픽 객체
  realmGraphicsMap: new Map<SectorIdType, Graphics>(), // 영토 색칠용 그래픽 객체 Map
  mapTexture: null as Texture<TextureSource<any>> | null,

  async loadMetadata() {
    this.pack = (await json("assets/data/pack.json")) ?? null;
    this.grid = (await json("assets/data/grid.json")) ?? null;
  },

  createQuadtree() {
    this.pack!.cells.cells.q = quadtree(
      this.pack!.cells.cells.p.map(([x, y], i) => [x, y, i]),
    );
  },

  async drawLand() {
    const landString = await text("assets/map/land.svg");
    const landGraphics = new Graphics().svg(landString);
    this.mapLayerStage!.addChild(landGraphics);
  },

  async drawLake() {
    const lakeString = await text("assets/map/lake.svg");
    const lakeGraphics = new Graphics().svg(lakeString);
    this.mapLayerStage!.addChild(lakeGraphics);
  },

  async drawCoastline() {
    await xml("assets/map/coastline.svg").then((xml) => {
      const coastlineGraphics = new Graphics();
      coastlineGraphics.rect(
        0,
        0,
        worldMetadata.mapWidth,
        worldMetadata.mapHeight,
      );
      const svgElement = xml.documentElement;
      select(svgElement)
        .select("#sea_island")
        .selectAll("path")
        .each(function () {
          const pathData = select(this).attr("d");
          const parsedCommands = parse(pathData);
          parsedCommands.forEach((cmd) => {
            switch (cmd[0]) {
              case "M":
                coastlineGraphics.moveTo(cmd[1], cmd[2]);
                break;
              case "C":
                coastlineGraphics.bezierCurveTo(
                  cmd[1],
                  cmd[2],
                  cmd[3],
                  cmd[4],
                  cmd[5],
                  cmd[6],
                );
                break;
              case "L":
                coastlineGraphics.lineTo(cmd[1], cmd[2]);
                break;
              case "Z":
                coastlineGraphics.closePath();
                break;
            }
          });
        });

      const shadowFilter = new DropShadowFilter({
        alpha: 1,
      });
      coastlineGraphics.filters = [shadowFilter];

      coastlineGraphics.stroke({
        color: "#1f3846",
        alpha: 0.5,
        pixelLine: true,
      });
      this.mapLayerStage!.addChild(coastlineGraphics);

      // RenderTexture 생성 (필터가 적용된 상태 저장)
      const renderTexture =
        this.pixiApp!.renderer.generateTexture(coastlineGraphics);

      // RenderTexture를 Sprite로 변환
      const sprite = new Sprite(renderTexture);
      sprite.x = coastlineGraphics.x;
      sprite.y = coastlineGraphics.y;
      // sprite 캐시 저장
      sprite.cacheAsTexture(true);

      // 필터가 적용된 이후 Graphics는 삭제
      coastlineGraphics.destroy();

      // 최적화된 Sprite 추가
      this.mapLayerStage!.addChild(sprite);
    });
  },

  async drawLakeIsland() {
    const lakeIslandString = await text("assets/map/lake_island.svg");
    const lakeIslandGraphics = new Graphics().svg(lakeIslandString);
    this.mapLayerStage!.addChild(lakeIslandGraphics);
  },

  fillOceanTexture() {
    const oceanGraphics = new Graphics();
    const oceanTexture = Texture.from(oceanPattern);
    oceanGraphics.rect(0, 0, worldMetadata.mapWidth, worldMetadata.mapHeight);
    oceanGraphics.fill({ texture: oceanTexture, alpha: 0.4 });

    // RenderTexture 생성 (필터가 적용된 상태 저장)
    const renderTexture = this.pixiApp!.renderer.generateTexture(oceanGraphics);

    // RenderTexture를 Sprite로 변환
    const sprite = new Sprite(renderTexture);
    sprite.x = oceanGraphics.x;
    sprite.y = oceanGraphics.y;
    // sprite 캐시 저장
    sprite.cacheAsTexture(true);

    // 필터가 적용된 이후 Graphics는 삭제
    oceanGraphics.destroy();

    // 최적화된 Sprite 추가
    this.mapLayerStage!.addChild(sprite);
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

  drawActionRoad(
    actionId: number,
    actionType: ActionType,
    originSector: number,
    targetSector: number,
  ) {
    const layerSvg = select("#map-layer-svg");
    const roadParentSvg = layerSvg.select("#unit_action_roads");
    const originSectorCenter = worldMetadata.findCellCenter(
      getPackPolygon(originSector),
    );
    const targetSectorCenter = worldMetadata.findCellCenter(
      getPackPolygon(targetSector),
    );
    const line = roadParentSvg
      .append("line")
      .attr("id", `road_${actionId}`)
      .attr("x1", originSectorCenter.x)
      .attr("y1", originSectorCenter.y)
      .attr("x2", targetSectorCenter.x)
      .attr("y2", targetSectorCenter.y)
      .attr("stroke", actionRoadColor.get(actionType)!)
      .attr("stroke-dashoffset", "0");

    const animate = () => {
      line
        .attr("stroke-dashoffset", "0")
        .transition()
        .duration(1500)
        .ease(easeLinear)
        .attr("stroke-dashoffset", "-9")
        .on("end", animate);
    };
    animate();
  },

  drawAttackLogo(targetSector: number, levyActionId: number) {
    const layerSvg = select("#map-layer-svg");
    const logoParentSvg = layerSvg.select("#action_logos");
    const sectorPoints = getPackPolygon(targetSector);
    const point = this.findCellCenter(sectorPoints);
    logoParentSvg
      .append("use")
      .attr("href", `#attack`)
      .attr("id", `logo_${levyActionId}`)
      .attr("x", point.x - 9)
      .attr("y", point.y - 9)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
  },

  drawReturnLogo(targetSector: number, levyActionId: number) {
    const layerSvg = select("#map-layer-svg");
    const logoParentSvg = layerSvg.select("#action_logos");
    const sectorPoints = getPackPolygon(targetSector);
    const point = this.findCellCenter(sectorPoints);
    logoParentSvg
      .append("use")
      .attr("href", `#return`)
      .attr("id", `logo_${levyActionId}`)
      .attr("x", point.x - 9)
      .attr("y", point.y - 9)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
  },

  eraseActionLogoAndRoad(actionId: number) {
    const parent = select("#map-layer-svg");
    parent
      .select(`#road_${actionId}`)
      .interrupt()
      .transition()
      .duration(500)
      .style("opacity", 0)
      .remove();
    parent
      .select(`#logo_${actionId}`)
      .transition()
      .duration(500)
      .style("opacity", 0)
      .remove();
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
      if (!this.provinceCells.has(province)) {
        this.provinceCells.set(province, []);
      }
      this.provinceCells.get(province)?.push(Number(key));
    }
  },

  drawProvinceCellsBorder(provinceId: number) {
    const currentProvinceCells = this.provinceCells.get(provinceId)!;
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

  fillRealm(realmId: number, cellIds: number[], color: string) {
    if (!this.realmGraphicsMap.has(realmId)) {
      return;
    }

    const graphics = this.realmGraphicsMap.get(realmId)!;
    const lineMap = new Map<string, PointData>();

    for (const cell of cellIds) {
      const onborder = this.pack!.cells.cells.c[cell].some(
        (n) => sectorRealmMapStored.get(n) !== realmId,
      );
      if (onborder) {
        const vertices = this.pack!.cells.cells.v[cell].filter((v) =>
          this.pack!.cells.vertices.c[v].some(
            (i) => sectorRealmMapStored.get(i) !== realmId,
          ),
        );

        const loopCount = vertices.length <= 2 ? 1 : vertices.length;
        const firstVertex = this.pack!.cells.cells.v[cell][0];
        const lastVertex =
          this.pack!.cells.cells.v[cell][
            this.pack!.cells.cells.v[cell].length - 1
          ];
        if (
          loopCount === 1 &&
          vertices[0] === firstVertex &&
          vertices[vertices.length - 1] === lastVertex
        ) {
          const f = vertices.length - 1;
          const b = f - 1;
          const valid = this.pack!.cells.vertices.c[vertices[f]].find((c1) => {
            return this.pack!.cells.vertices.c[vertices[b]].find(
              (c2) => c1 === c2 && sectorRealmMapStored.get(c1) !== realmId,
            );
          });
          if (valid) {
            const startPoint = this.pack!.cells.vertices.p[vertices[f]];
            const endPoint = this.pack!.cells.vertices.p[vertices[b]];

            lineMap.set(`${startPoint[0]} ${startPoint[1]}`, {
              x: endPoint[0],
              y: endPoint[1],
            });
          }
        } else {
          for (let i = 0; i < loopCount; i++) {
            const f = i % vertices.length;
            const b = (i + 1) % vertices.length;

            const valid = this.pack!.cells.vertices.c[vertices[f]].find(
              (c1) => {
                return this.pack!.cells.vertices.c[vertices[b]].find(
                  (c2) => c1 === c2 && sectorRealmMapStored.get(c1) !== realmId,
                );
              },
            );
            if (valid) {
              const startPoint = this.pack!.cells.vertices.p[vertices[f]];
              const endPoint = this.pack!.cells.vertices.p[vertices[b]];

              lineMap.set(`${startPoint[0]} ${startPoint[1]}`, {
                x: endPoint[0],
                y: endPoint[1],
              });
            }
          }
        }
      }
    }

    let keys = [...lineMap.keys()];
    let vKey = keys[0];
    let initKey = vKey;
    const splitedInitKey = initKey.split(" ");
    graphics.moveTo(Number(splitedInitKey[0]), Number(splitedInitKey[1]));

    while (true) {
      const value = lineMap.get(vKey)!;
      graphics.lineTo(value.x, value.y);
      lineMap.delete(vKey);
      const nextKey = `${value.x} ${value.y}`;
      if (nextKey === initKey) {
        if (lineMap.size <= 0) {
          break;
        }
        keys = [...lineMap.keys()];
        vKey = keys[0];
        initKey = vKey;
        const newSplitedInitKey = initKey.split(" ");
        graphics.moveTo(
          Number(newSplitedInitKey[0]),
          Number(newSplitedInitKey[1]),
        );
      } else {
        vKey = nextKey;
      }
    }

    const borderTexture = Texture.from("/assets/img/texture12.png");
    const innerTexture = Texture.from("/assets/img/texture8.png");

    graphics.fill({ color, alpha: 0.4, texture: innerTexture });
    graphics.stroke({
      color,
      width: 4,
      alignment: 1,
      cap: "round",
      texture: borderTexture,
    });
    this.mapLayerStage!.addChild(graphics);
  },

  removeRealm(realmId: number) {
    this.realmGraphicsMap.get(realmId)?.clear();
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

  updateSectorOwner(body: UpdateSectorBodyType) {
    const sector = body.sector;
    const oldOwner = realmInfoMapStored.get(body.old_realm_id);
    const newOwnerColor = realmInfoMapStored.get(body.new_realm_id)!;
    // 소유권 이전
    sectorRealmMapStored.set(sector, body.new_realm_id);
    const realmCells = this.realmCells.get(body.new_realm_id)!;
    realmCells.add(sector);
    // fill new owner
    this.removeRealm(body.new_realm_id);
    this.fillRealm(
      body.new_realm_id,
      [...realmCells.keys()],
      newOwnerColor!.color,
    );

    // 토착세력이 아닐 경우
    if (oldOwner) {
      const oldOwnerColor = oldOwner.color;
      this.realmCells.get(body.old_realm_id)?.delete(sector);
      // redraw old owner
      this.removeRealm(body.old_realm_id);
      this.fillRealm(
        body.old_realm_id,
        [...this.realmCells.get(body.old_realm_id)!],
        oldOwnerColor,
      );
    }
  },
  async updateLevyEncampment(action: LevyActionResponseType) {
    const originLevies = ourSectorLeviesStored.get(action.origin_sector)!;
    originLevies.delete(action.levy_id);

    ourSectorLeviesStored.delete(action.origin_sector);
    ourSectorLeviesStored.set(action.origin_sector, originLevies);

    const res = await levyApi.findLevy(action.levy_id);
    switch (res.status) {
      case HttpStatusCode.Ok:
        storeCellLevies([res.data.realm_levy]);
        break;
      default:
        alert(res.data.api_response.description);
        break;
    }
    ourRealmLevyActionsStored.delete(action.levy_action_id);
  },
  async updateReturnedLevyEncampment(action: LevyActionResponseType) {
    const encampmentLevies = ourSectorLeviesStored.get(action.target_sector)!;
    encampmentLevies.delete(action.levy_id);

    ourSectorLeviesStored.delete(action.target_sector);
    ourSectorLeviesStored.set(action.target_sector, encampmentLevies);

    const res = await levyApi.findLevy(action.levy_id);
    switch (res.status) {
      case HttpStatusCode.Ok:
        storeCellLevies([res.data.realm_levy]);
        break;
      default:
        alert(res.data.api_response.description);
        break;
    }
    ourRealmLevyActionsStored.delete(action.levy_action_id);
  },
  updateAnnihilatedLevy(action: LevyActionResponseType) {
    const sectorLevies = ourSectorLeviesStored.get(action.origin_sector)!;
    const prevLevy = sectorLevies.get(action.levy_id)!;
    const annihilatedLevy: LeviesStoredType = {
      levyAffiliation: prevLevy.levyAffiliation,
      levy: {
        levy_id: prevLevy.levy.levy_id,
        name: prevLevy.levy.name,
        encampment: prevLevy.levy.encampment,
        swordmen: 0,
        shield_bearers: 0,
        archers: 0,
        lancers: 0,
        supply_troop: prevLevy.levy.supply_troop,
        movement_speed: 0,
        stationed: true,
      },
    };
    sectorLevies.set(action.levy_id, annihilatedLevy);
    ourSectorLeviesStored.delete(action.origin_sector);
    ourSectorLeviesStored.set(action.origin_sector, sectorLevies);
  },
};

// get polygon points for packed cells knowing cell id
export function getPackPolygon(i: number): PointData[] {
  return worldMetadata.pack!.cells.cells.v[i].map((v) => {
    const point = worldMetadata.pack!.cells.vertices.p[v];
    return { x: point[0], y: point[1] };
  });
}
