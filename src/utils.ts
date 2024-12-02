import { zoomTransform } from "d3-zoom";
import { select } from "d3-selection";

export function getSVGCoords(svgElement: SVGSVGElement, x: number, y: number) {
  const svg = select(svgElement);
  const transform = zoomTransform(svg.node() as any);

  return {
    x: (x - transform.x) / transform.k,
    y: (y - transform.y) / transform.k,
  };
}
