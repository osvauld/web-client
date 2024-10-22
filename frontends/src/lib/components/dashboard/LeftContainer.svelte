<script lang="ts">
	import { Logo } from "./icons";
	import FolderSideList from "./folders/FolderSideList.svelte";
</script>

<div
	class="flex justify-center items-center h-[6rem] min-w-[200px]"
	aria-label="osvauld logo">
	<Logo />
</div>

<aside
	class="scroll-m-0 h-[82%] w-full min-w-[200px] scroll-smooth justify-center flex items-center">
	<FolderSideList />
</aside>
