<script lang="ts">
  import CredentialList from "./credentials/credentialList.svelte";
  import GroupList from "./groups/GroupList.svelte";

  import { selectedPage } from "./store";
  import { Profile, Lens } from "./icons";
</script>

<div class="flex flex-col h-auto">
  <div class="h-[7.8rem] pr-4 flex justify-between items-center">
    <div
      class="h-[1.9rem] w-2/5 px-2 mx-auto flex justify-start items-center border border-osvauld-iconblack rounded-lg cursor-pointer"
    >
      <Lens />
      <input
        type="text"
        class="h-[1.75rem] w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
        placeholder="Search"
      />
    </div>
    <div><Profile /></div>
    <!-- Content for the top part (search bar) -->
    <!-- Horizontal line -->
  </div>

  <div
    class="h-auto min-h-[85vh] bg-osvauld-frameblack border-2 border-osvauld-iconblack rounded-2xl mr-4"
  >
    <!-- Content for the bottom part (dynamic content) -->
    {#if $selectedPage === "Credentials"}
      <CredentialList />
    {:else if $selectedPage === "Groups"}
      <GroupList />
    {/if}
  </div>
</div>
