<script lang="ts">
  import MyInfo from "../lib/world/components/MyInfo.svelte";
  import RegionInfo from "../lib/world/components/RegionInfo.svelte";
  import { getSVGCoords } from "../utils";

  let mapContainer: HTMLDivElement | null = $state(null);
  let map: SVGSVGElement;
  let minScale: number = 1;
  let scale: number = 1; // 확대/축소 배율
  let translateX: number = 0; // X축 이동
  let translateY: number = 0; // Y축 이동
  let isDragging: boolean = false; // 드래그 중인지 여부
  let startX: number = 0; // 드래그 시작 위치 (X)
  let startY: number = 0; // 드래그 시작 위치 (Y)

  $effect(() => {
    const mapNode = mapContainer?.querySelector("svg");
    if (!mapNode) {
      return;
    }
    map = mapNode;
    map.addEventListener("mousedown", onMouseDown);
    map.addEventListener("wheel", onWheel);

    // 초기 map scale value setting
    const containerRect = mapContainer!!.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();

    const maxX = containerRect.right - mapRect.right;
    const maxY = containerRect.bottom - mapRect.bottom;

    if (maxX > 0 || maxY > 0) {
      // 새로 조정할 스케일 계산 (너비와 높이를 각각 비교)
      const widthScale = containerRect.width / mapRect.width;
      const heightScale = containerRect.height / mapRect.height;

      // 최종 스케일로 업데이트 (너비와 높이 중 큰 쪽을 선택)
      minScale = Math.max(widthScale, heightScale);
      scale = minScale;

      // 트랜스폼 적용
      map.style.transform = `scale(${minScale})`;

      const minX = (containerRect.left - mapRect.left) * scale;
      const minY = (containerRect.top - mapRect.top) * scale;
      map.style.transform = `translate(${minX}px, ${minY}px)`;
    }

    return () => {
      map.removeEventListener("mousedown", onMouseDown);
      map.removeEventListener("wheel", onWheel);
    };
  });

  const loadMap = async (path: string) => {
    const res = await fetch(path);
    const svgContent = await res.text();
    return svgContent;
  };

  const onWheel = (event: WheelEvent) => {
    if (!map || !mapContainer) {
      return;
    }

    event.preventDefault(); // 기본 스크롤 방지

    const rect = mapContainer.getBoundingClientRect();
    const containerCenterX = rect.width / 2;
    const containerCenterY = rect.height / 2;

    const { x, y } = getSVGCoords(map, containerCenterX, containerCenterY);

    // scale에 따라 transform-origin을 설정
    map.style.transformOrigin = `${containerCenterX}px ${containerCenterY}px`;

    // 기존 좌표에 대한 스케일 적용
    const prevScale = scale;
    scale += event.deltaY * -0.01;
    scale = Math.min(Math.max(minScale, scale), 3); // 스케일 제한

    // 중심 기준 이동 계산
    const scaleFactor = scale / prevScale;
    translateX -= (containerCenterX - translateX) * (scaleFactor - 1);
    translateY -= (containerCenterY - translateY) * (scaleFactor - 1);

    // 트랜스폼 업데이트
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  const onMouseDown = (event: MouseEvent) => {
    if (!map || isDragging) {
      return;
    }
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!mapContainer || !map || !isDragging) {
      return;
    }

    const containerRect = mapContainer.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();

    // 이동 거리 계산
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    // 경계 제한 계산
    const minX = (containerRect.left - mapRect.left) * scale;
    const maxX = (containerRect.right - mapRect.right) * scale;
    const minY = (containerRect.top - mapRect.top) * scale;
    const maxY = (containerRect.bottom - mapRect.bottom) * scale;

    // X축 이동
    if (deltaX > 0) {
      translateX += Math.min(deltaX, minX);
    } else {
      translateX += Math.max(deltaX, maxX);
    }

    // Y축 이동
    if (deltaY > 0) {
      translateY += Math.min(deltaY, minY);
    } else {
      translateY += Math.max(deltaY, maxY);
    }

    // 시작 위치 갱신
    startX = event.clientX;
    startY = event.clientY;

    // 이동 적용
    map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  const onMouseUp = () => {
    if (!map || !isDragging) {
      return;
    }
    isDragging = false;
  };

  const mapPs = loadMap("/src/assets/map/kania.svg");
</script>

{#await mapPs then map}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="hole_screen" onmousemove={onMouseMove} onmouseup={onMouseUp}>
    <MyInfo />
    <div class="map_container" bind:this={mapContainer}>
      {@html map}
    </div>
    <RegionInfo />
  </div>
{/await}

<style>
  .hole_screen {
    width: 100%;
    height: 100vh;
    display: flex;
  }

  .map_container {
    flex: 1;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
</style>
