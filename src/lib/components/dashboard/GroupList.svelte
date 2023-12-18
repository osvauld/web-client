<script lang="ts">
  import { fetchGroupUsers } from "../../apis/group.api";
  import { onMount, onDestroy } from "svelte";
  import { selectedGroup } from "../../store/group.store";
  import { User } from "../../dtos/user.dto";
  import { Unsubscriber } from "svelte/store";
  let groupUsers: User[] = [];
  let unsubscribe: Unsubscriber;

  onMount(() => {
    unsubscribe = selectedGroup.subscribe((value) => {
      if (value) {
        fetchGroupUsers(value.id).then((users) => {
          groupUsers = users;
        });
      }
    });
  });

  onDestroy(() => {
    unsubscribe();
    groupUsers = [];
  });
</script>

<div class="overflow-x-auto">
  <div class="min-w-screen min-h-screen flex overflow-hidden">
    <div class="w-full">
      <div class="shadow-md rounded my-6">
        <table class="min-w-max w-full table-auto">
          <thead>
            <tr class="text-sm leading-normal">
              <th class="py-3 px-6 text-left">Name</th>
              <th class="py-3 px-6 text-left">USERNAME</th>
            </tr>
          </thead>
          <tbody class="text-xl font-light">
            {#each groupUsers as user}
              <tr class="hover:border hover:border-blue-900">
                <td class="py-3 px-6 text-left whitespace-nowrap">
                  {user.name}
                </td>
                <td class="py-3 px-6 text-left">
                  {user.username}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
