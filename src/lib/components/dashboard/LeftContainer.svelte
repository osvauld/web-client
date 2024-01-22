<script lang="ts">

  import { Logo, Toggle } from "./icons"
  import SideList from "./SideList.svelte";
</script>

<div class="flex justify-center items-center h-[124px]">
  <Logo />
</div>


<Toggle />
<!-- Add scrolbar style -->
<div class="scroll-m-0 scroll-smooth justify-center flex items-center mt-6">
  <SideList />
</div>
