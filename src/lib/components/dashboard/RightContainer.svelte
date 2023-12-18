<script>
  import CredentialList from "./credentialList.svelte";
  import { selectedPage } from "../../store/ui.store";
  import GroupList from "./GroupList.svelte";
</script>

<div class="flex flex-col h-full">
  <div class="h-1/6">
    <!-- Content for the top part (search bar) -->
    <!-- Horizontal line -->
  </div>

  <div class="border-b border-[#04070c]"></div>
  <div class={"h-5/6 D bg-macchiato-background"}>
    <!-- Content for the bottom part (dynamic content) -->
    {#if $selectedPage === "Credentials"}
      <CredentialList />
    {:else if $selectedPage === "Groups"}
      <GroupList />
    {/if}
  </div>
</div>
