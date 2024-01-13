<script lang="ts">
  import CredentialList from "./credentials/credentialList.svelte";
  import GroupList from "./groups/GroupList.svelte";
  import Profile from "../../components/basic/profile.svelte"

  import { selectedPage } from "./store";
  import Lens from '../basic/lens.svelte';

</script>

<div class="flex flex-col h-auto">
  <div class="h-[124px] pr-4 flex justify-between items-center ">
    <div class="h-[30px] w-2/5 px-2 mx-auto flex justify-start items-center border border-osvauld-bordergreen rounded-lg cursor-pointer">
      <Lens/>
      <input type="text" class="h-[28px] w-full bg-osvauld-ninjablack border-0 text-osvauld-quarzowhite  placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer" placeholder="Search">
    </div>
    <div><Profile/></div>
    <!-- Content for the top part (search bar) -->
    <!-- Horizontal line -->
  </div>

  <div class="h-auto bg-osvauld-ninjablack border-2 border-osvauld-bordergreen rounded-2xl mr-4">
    <!-- Content for the bottom part (dynamic content) -->
    {#if $selectedPage === "Credentials"}
      <CredentialList />
    {:else if $selectedPage === "Groups"}
      <GroupList />
    {/if}
  </div>
</div>
