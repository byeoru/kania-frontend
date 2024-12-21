<script lang="ts">
  import { HttpStatusCode } from "axios";
  import { userApi } from "../lib/Home/api/user";
  import { navigate } from "../lib/navigation.svelte.ts";

  async function login(event: SubmitEvent) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const res = await userApi.login({
      email: form.email.value,
      password: form.password.value,
    });

    if (res.status === HttpStatusCode.Ok) {
      navigate("/world");
    }
  }
</script>

<form onsubmit={login}>
  <input type="email" name="email" />
  <input type="password" name="password" />
  <button type="submit">로그인</button>
</form>
