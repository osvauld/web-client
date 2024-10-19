<script lang="ts">
	import { Logo } from "./icons";
	import FolderSideList from "./folders/FolderSideList.svelte";
</script>

<div class="flex justify-center items-center h-[6rem] scale-[0.8]">
	<Logo />
</div>

<div
	class="scroll-m-0 h-[82%] w-full scroll-smooth justify-center flex items-center mt-6">
	<FolderSideList />
</div>
