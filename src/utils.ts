import {
  setAttackLevyInfo,
  setMapInteractionMode,
  setModalContent,
  setModalProps,
  setModalTitle,
  showModal,
} from "./lib/shared.svelte";
import { worldMetadata } from "./lib/world/worldMetadata";

// SVG local 좌표 변환 함수
export function getLocalSvgCoordinates(event: MouseEvent, svg: SVGSVGElement) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  // 화면 좌표를 SVG 좌표로 변환
  const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
  return svgPoint;
}

export function getPoliticalEntitySetKr(enString: string) {
  switch (enString) {
    case "Tribe":
      return { politicalEntity: "부족국가", status: "추장" };
    case "TribalConfederation":
      return { politicalEntity: "부족연맹", status: "대추장" };
    case "Kingdom":
      return { politicalEntity: "왕국", status: "왕" };
    case "KingdomConfederation":
      return { politicalEntity: "왕국연맹", status: "대왕" };
    case "Empire":
      return { politicalEntity: "제국", status: "황제" };
    case "FeudatoryState":
      return { politicalEntity: "번왕국", status: "번왕" };
    default:
      return { politicalEntity: "없음", status: "없음" };
  }
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
