<script>
  import Logo from "../basic/logo.svelte";
  import Toggle from "../basic/toggle.svelte";
  import SideList from "./SideList.svelte";
</script>

<div class="flex justify-center pt-10 pb-5">
  <Logo />
</div>

<Toggle />
<!-- Add scrolbar style -->
<div class="scroll-m-0 scroll-smooth justify-center flex items-center">
  <SideList />
</div>
