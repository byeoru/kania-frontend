// SVG local 좌표 변환 함수
export function getLocalSvgCoordinates(event: MouseEvent, svg: SVGSVGElement) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  // 화면 좌표를 SVG 좌표로 변환
  const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
  return svgPoint;
}
