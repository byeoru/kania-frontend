<script lang="ts">
  import { showModal } from "./shared";

  let { header, children } = $props();

  let dialog = $state<HTMLDialogElement>(); // HTMLDialogElement

  $effect(() => {
    if (showModal) dialog?.showModal();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclose={() => {
    $showModal = false;
  }}
>
  <div>
    <div class="header">
      {@render header?.()}
    </div>
    <hr />
    <div class="body">
      {@render children?.()}
    </div>
    <hr />
  </div>
</dialog>

<style>
  dialog {
    max-width: 32em;
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
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
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
