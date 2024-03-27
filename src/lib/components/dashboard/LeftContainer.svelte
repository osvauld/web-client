<script lang="ts">
  import { Logo, Toggle } from "./icons";
  import SideList from "./SideList.svelte";
</script>

<div class="flex justify-center items-center h-[6rem] scale-[0.8]">
  <Logo />
</div>

<Toggle />
<!-- Add scrolbar style -->
<div
  class="scroll-m-0 h-auto w-full scroll-smooth justify-center flex items-center mt-6"
>
  <SideList />
</div>
