<script lang="ts">
  import Logo from "../basic/logo.svelte";
  import Toggle from "../basic/toggle.svelte";
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
