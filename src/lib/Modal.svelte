<script lang="ts">
  import { showModal } from "./shared.svelte.ts";

  let { header, children, props } = $props();

  let dialog = $state<HTMLDialogElement>(); // HTMLDialogElement

  $effect(() => {
    if (showModal) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclose={() => {
    $showModal = false;
  }}
>
  <div class="header">
    {header}
  </div>
  <div class="body">
    <!-- svelte-ignore svelte_component_deprecated -->
    <svelte:component this={children} {...props} />
  </div>
</dialog>

<style>
  dialog {
    width: 17em;
    height: 37em;
    background-image: url("/assets/img/character_select_texture.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-color: transparent;
    border: none;
    outline: none;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .header {
    width: 97%;
    height: 2.5em;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2.3em;
    font-size: 1.3em;
    font-weight: 400;
    color: rgb(136, 93, 36);
  }
  .body {
    width: 97%;
    height: 30em;
    margin-top: 0.3em;
    position: relative;
    display: flex;
    justify-content: center;
  }
</style>
