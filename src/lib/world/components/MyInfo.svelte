<script lang="ts">
  const {
    myRealmId,
    worldTime,
  }: { myRealmId: number | undefined; worldTime: string | undefined } =
    $props();

  const formattedDate = $derived(
    worldTime
      ? new Date(worldTime).toLocaleString("ko-kr", {
          timeZone: "UTC", // UTC 시간대로 설정
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "정보 없음",
  );
</script>

<div class="my_info_container">
  {#if myRealmId}
    <section class="my_realm_info">
      <div class="realm_emblem">국기</div>
      <div class="my_info"></div>
    </section>
  {/if}
  <div class="world_time">
    <span>카니아력</span>
    <span>{formattedDate}</span>
  </div>
</div>

<style>
  .my_info_container {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 6;
  }
  section {
    width: 20em;
    height: 3em;
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 0.5rem;
    background-color: antiquewhite;
  }
  .realm_emblem {
    height: 100%;
    aspect-ratio: 1;
    background-color: blueviolet;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
