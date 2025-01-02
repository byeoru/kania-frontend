<script lang="ts">
  import FooterBtn from "./FooterBtn.svelte";
</script>

<form
  class="attack_form"
  onsubmit={async (event: SubmitEvent) => {
    event.preventDefault();
  }}
>
  <div>정말 공격하시겠습니까?</div>
  <FooterBtn agreeTitle="공격" cancelTitle="취소" />
</form>

<style>
  .attack_form {
    width: 85%;
    height: 25.8em;
    display: flex;
    flex-direction: column;
  }
</style>
