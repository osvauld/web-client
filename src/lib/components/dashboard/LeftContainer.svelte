<script lang="ts">
  import { Logo, Toggle } from "./icons";
  import SideList from "./SideList.svelte";
</script>

<div class="flex justify-center items-center h-[6rem] scale-[0.8]">
  <Logo />
</div>

<div class="flex justify-center items-center w-full">
  <Toggle />
</div>
<div
  class="scroll-m-0 h-[85%] w-full scroll-smooth justify-center flex items-center mt-6"
>
  <SideList />
</div>
