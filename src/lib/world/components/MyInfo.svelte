<script lang="ts">
  const { cellInfo } = $props();
</script>

{#if cellInfo}
  <div class="info">
    {`x: ${cellInfo.x}, y: ${cellInfo.y}, idx: ${cellInfo.i}, type: ${cellInfo.type}, province: ${cellInfo.province}`}
  </div>
{/if}

<style>
  .info {
    position: fixed;
    z-index: 3;
  }
</style>
