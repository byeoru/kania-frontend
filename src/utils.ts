import type { PointData } from "pixi.js";
import {
  setAttackLevyInfo,
  setMapInteractionMode,
  setModalContent,
  setModalProps,
  setModalTitle,
  showModal,
} from "./lib/shared.svelte";
import { worldMetadata } from "./lib/world/worldMetadata";
import type { FeatureClass } from "./dataTypes/packCellsType";
import { mapInteraction } from "./lib/world/mapInteraction";

// SVG local 좌표 변환 함수
export function getLocalSvgCoordinates(
  event: MouseEvent,
  svg: SVGSVGElement,
  container: HTMLDivElement,
) {
  const point = svg.createSVGPoint();

  // 🛠 Safari에서는 zoom에 따른 보정 필요
  const zoomFactor = mapInteraction.scale;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  let x = event.clientX + container.scrollLeft;
  let y = event.clientY + container.scrollTop;

  // Safari에서는 zoom 보정 적용
  if (isSafari) {
    console.log(isSafari);
    x /= zoomFactor;
    y /= zoomFactor;
  }

  point.x = x;
  point.y = y;

  const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
  return svgPoint;
}

export function openModal(title: string, content: any, props?: {}) {
  setModalTitle(title);
  setModalContent(content);
  setModalProps(props);
  showModal.set(true);
}

export function updateToNormalMode() {
  worldMetadata.removeSelectedSectors();
  worldMetadata.removeOneCell();
  setAttackLevyInfo(null);
  setMapInteractionMode("NORMAL");
}

export const calculateDistance = (
  originCenter: PointData,
  targetCenter: PointData,
) => {
  // 단위: km
  const distance = Math.sqrt(
    Math.pow(targetCenter.x - originCenter.x, 2) +
      Math.pow(targetCenter.y - originCenter.y, 2),
  );
  return distance;
};

export const calculateDurationHours = (distance: number, unitSpeed: number) => {
  // 총 소요 시간(시간 단위)
  const totalHours = distance / unitSpeed;
  return totalHours;
};

export const calculateCompletionDate = (
  currentWorldTime: Date,
  deltaHours: number,
) => {
  // 소수점 부분을 분으로 변환
  const hours = Math.floor(deltaHours); // 시간 부분
  const minutes = Math.round((deltaHours - hours) * 60); // 분 부분

  // 현재 날짜 복사
  const arrivalDate = new Date(currentWorldTime);

  // 시간과 분을 각각 추가
  arrivalDate.setHours(arrivalDate.getHours() + hours);
  arrivalDate.setMinutes(arrivalDate.getMinutes() + minutes);

  return arrivalDate;
};

export const convertHoursToDaysHoursMinutes = (
  totalHours: number,
): { days: number; hours: number; minutes: number } => {
  const days = Math.floor(totalHours / 24); // 총 시간을 24로 나눠 '일' 계산
  const remainingHours = totalHours % 24; // 남은 시간을 계산
  const hours = Math.floor(remainingHours); // 정수 시간
  const minutes = Math.round((remainingHours - hours) * 60); // 소수점 이하를 분으로 변환

  return { days, hours, minutes };
};

export const toWorldTimeString = (date: Date) => {
  return date.toLocaleString("ko-kr", {
    timeZone: "UTC", // UTC 시간대로 설정
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// get surface elevation
export const getElevation = (f: FeatureClass, h: number) => {
  if (f.land) return getHeight(h); // land: usual height
  if (f.border) return "0 m"; // ocean: 0
  if (f.type === "lake") return getHeight(f.height!); // lake: defined on river generation
};

export const getHeight = (h: number) => {
  const unitRatio = 1; // if meter
  let height = -990;
  const heightExponentValue = 2;
  if (h >= 20) height = Math.pow(h - 18, +heightExponentValue);
  else if (h < 20 && h > 0) height = ((h - 20) / h) * 50;

  return `${rn(height * unitRatio)} m`;
};

// round value to d decimals
function rn(v: number, d = 0) {
  const m = Math.pow(10, d);
  return Math.round(v * m) / m;
}
