<script>
  import CredsListed from "./components/CredsListed.svelte";
  import CredsOpen from "./components/CredsOpen.svelte";
  let status = false;
</script>

<div class="flex justify-center flex-col items-center">
  <div class="h-[490px] w-11/12 bg-[#2E3654] my-3">
    {#if status}
      <CredsOpen />
    {:else}
      <CredsListed />
    {/if}
  </div>
</div>
