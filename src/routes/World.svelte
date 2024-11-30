<script lang="ts">
  const loadMap = async (path: string) => {
    const res = await fetch(path);
    const svgContent = await res.text();
    return svgContent;
  };
  const mapPs = loadMap("/src/assets/map/kania.svg");
</script>

{#await mapPs then map}
  <div class="map_container">{@html map}</div>
{/await}
