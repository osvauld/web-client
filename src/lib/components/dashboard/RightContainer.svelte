<script lang="ts">
  import CredentialList from "./credentials/credentialList.svelte";
  import GroupList from "./groups/GroupList.svelte";

  import { selectedPage } from "./store";
</script>

<div class="flex flex-col h-full">
  <div class="h-[124px] pt-11">
    <div class="h-[30px] w-2/5 mx-auto border border-osvauld-bordergreen rounded-lg"></div>
    <!-- Content for the top part (search bar) -->
    <!-- Horizontal line -->
  </div>

  <div class="h-5/6 D bg-osvauld-ninjablack border-2 border-osvauld-bordergreen rounded-2xl">
    <!-- Content for the bottom part (dynamic content) -->
    {#if $selectedPage === "Credentials"}
      <CredentialList />
    {:else if $selectedPage === "Groups"}
      <GroupList />
    {/if}
  </div>
</div>
