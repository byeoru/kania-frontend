<script lang="ts">
  import type { CurrentCellInfoType } from "../../../dataTypes/aboutUiType";
  import { type ProvinceClass } from "../../../dataTypes/packCellsType";
  import type { RealmsStoredType } from "../../../model/realm";
  import { worldMetadata } from "../worldMetadata";

  const { realmStored }: { realmStored: RealmsStoredType } = $props();
</script>

<!-- {#if realmStored.myRealmId} -->
<section class="my_realm_info">
  <div class="realm_emblem">엠블럼 이미지</div>
</section>

<!-- {/if} -->

<style>
  section {
    width: 20em;
    height: 3em;
    position: absolute;
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 0.5rem;
    z-index: 6;
    background-color: antiquewhite;
  }
  .realm_emblem {
    height: 100%;
    aspect-ratio: 1;
    background-color: blueviolet;
  }
</style>
