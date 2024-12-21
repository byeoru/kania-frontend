<script lang="ts">
  import { currentRoute, routes } from "./lib/navigation.svelte.ts";
  import NotFound from "./routes/NotFound.svelte";
</script>

<!-- <nav>
  <a href="/" on:click|preventDefault={() => navigate("/")}>Home</a>
</nav> -->

<main>
  {#if routes[currentRoute.value]}
    <svelte:component this={routes[currentRoute.value]} />
  {:else}
    <NotFound />
  {/if}
</main>
