<script lang="ts">
  import Home from "./routes/Home.svelte";
  import type { Component } from "svelte";
  import NotFound from "./routes/NotFound.svelte";
  import World from "./routes/World.svelte";

  // 현재 경로 상태
  let currentRoute: string = window.location.pathname;

  // // 경로와 컴포넌트 매핑
  const routes: Record<string, Component> = {
    "/": Home,
    "/world": World,
  };

  // URL 변경 감지 함수
  const handleRouteChange = (): void => {
    currentRoute = window.location.pathname;
  };

  // popstate 이벤트로 뒤로가기/앞으로가기 감지
  window.addEventListener("popstate", handleRouteChange);

  // 네비게이션 함수
  const navigate = (path: string): void => {
    if (path !== currentRoute) {
      history.pushState(null, "", path);
      handleRouteChange();
    }
  };
</script>

<!-- <nav>
  <a href="/" on:click|preventDefault={() => navigate('/')}>Home</a>
</nav> -->

<main>
  {#if routes[currentRoute]}
    <svelte:component this={routes[currentRoute]} />
  {:else}
    <NotFound />
  {/if}
</main>
