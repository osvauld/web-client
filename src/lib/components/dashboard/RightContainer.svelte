<script>
  import SecretList from "./SecretList.svelte";
</script>

<div class="flex flex-col h-full">
  <div class="h-1/6">
    <!-- Content for the top part (search bar) -->
    <!-- Horizontal line -->
  </div>

  <div class="border-b border-[#04070c]"></div>
  <div class="h-5/6">
    <!-- Content for the bottom part (dynamic content) -->
    <SecretList />
  </div>
</div>
