<script lang="ts">
  import { showModal } from "../../../shared.svelte";

  const { agreeTitle, cancelTitle } = $props();
</script>

<div class="footer">
  <button type="submit" class="agree">{agreeTitle}</button>
  <button onclick={() => ($showModal = false)} class="cancel"
    >{cancelTitle}</button
  >
</div>

<style>
  .footer {
    width: 100%;
    height: 4.2em;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.2em;
    position: absolute;
    bottom: 0em;
    left: 0em;
    right: 0em;
  }
  .footer button {
    width: 40%;
    height: 50%;
    background-size: contain;
    background-repeat: no-repeat;
    background-color: transparent;
    border: none;
    outline: none;
    color: rgb(255, 255, 255);
    font-size: 0.7em;
    font-weight: 400;
  }
  .agree {
    background-image: url("/assets/img/normal_button_p.png");
  }
  .agree:active {
    background-image: url("/assets/img/normal_button_n.png");
  }
  .cancel {
    background-image: url("/assets/img/normal_button_d.png");
  }
</style>
