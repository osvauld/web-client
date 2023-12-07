<script>
  import { groupStore, selectedGroup } from "../../store/group.store";
  const selectGroup = (group) => {
    selectedGroup.set(group);
  };
</script>

<div>
  <ul>
    {#each $groupStore as group}
      <li class="list-none">
        <button
          on:click={() => selectGroup(group)}
          class={`p-2 text-lg rounded-2xl flex items-center cursor-pointer 
                        ${
                          $selectedGroup === group
                            ? "bg-blue-800 border border-blue-900 "
                            : "hover:border hover:border-blue-900"
                        }`}
        >
          {group.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
