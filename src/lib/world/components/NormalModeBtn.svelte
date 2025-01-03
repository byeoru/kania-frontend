<script lang="ts">
  import { updateToNormalMode } from "../../../utils";

  function onNormalModeBtnClick() {
    updateToNormalMode();
  }
</script>

<button class="normal_mode_btn" onclick={onNormalModeBtnClick}>취소</button>

<style>
  .normal_mode_btn {
    width: 8em;
    height: 2.5em;
    background-image: url("/assets/img/normal_button_d.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-color: transparent;
    border: none;
    outline: none;
    position: absolute;
    bottom: 7em;
    left: 40%;
    z-index: 4;
    color: aliceblue;
    font-size: 0.8em;
    padding-top: 0.2em;
  }
</style>
