<script lang="ts">
  import { fly } from "svelte/transition";
  import EncryptedField from "./EncryptedField.svelte";
  import PlainField from "./PlainField.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import {
    fetchCredentialUsers,
    fetchCredentialGroups,
    removeGroupFromCredential,
    removeUserFromCredential,
    editGroupPermissionForCredential,
    editUserPermissionForCredential,
  } from "../apis";
  import {
    showCredentialDetailsDrawer,
    showEditCredentialDialog,
    showCredentialEditor,
    credentialIdForEdit,
  } from "../store";
  import { ClosePanel, EditIcon } from "../icons";
  import { onMount } from "svelte";
  import ExistingListItem from "../components/ExistingListItem.svelte";
  import {
    Credential,
    Fields,
    GroupWithAccessType,
    UserWithAccessType,
  } from "../dtos";
  export let credential: Credential;
  export let sensitiveFields: Fields[];
  let selectedTab = "Groups";
  let accessListSelected = false;
  let accessEdit = false;
  let users: UserWithAccessType[] = [];
  let groups: GroupWithAccessType[] = [];

  const toggleSelect = async (e: any) => {
    selectedTab = e.detail;
    if (selectedTab == "Users") {
      const usersResponse = await fetchCredentialUsers(credential.credentialId);
      users = usersResponse.data;
    } else if (selectedTab == "Groups") {
      const groupsResponse = await fetchCredentialGroups(
        credential.credentialId
      );
      groups = groupsResponse.data;
    }
  };

  const removeGroupFromCredentialHandler = async (
    group: GroupWithAccessType
  ) => {
    await removeGroupFromCredential(credential.credentialId, group.groupId);
    await toggleSelect({ detail: "Groups" });
  };
  const removeUserFromCredentialHandler = async (user: UserWithAccessType) => {
    await removeUserFromCredential(credential.credentialId, user.id);
    await toggleSelect({ detail: "Users" });
  };

  const permissionChangeHandler = async (e: any, id: string, type: string) => {
    console.log(e.detail, "cred details");
    if (type == "user") {
      await editUserPermissionForCredential(
        credential.credentialId,
        id,
        e.detail
      );
      await toggleSelect({ detail: "Users" });
    } else {
      await editGroupPermissionForCredential(
        credential.credentialId,
        id,
        e.detail
      );
      await toggleSelect({ detail: "Groups" });
    }
  };

  onMount(async () => {
    // @ts-ignore
    credentialIdForEdit.set(credential.credentialId);
    const groupsResponse = await fetchCredentialGroups(credential.credentialId);
    groups = groupsResponse.data;
  });
</script>

<div
  class="fixed top-0 right-0 z-50 flex justify-end rounded-xl blur-none"
  in:fly
  out:fly
>
  <div
    class="w-[30vw] h-screen shadow-xl translate-x-0 bg-osvauld-frameblack p-6 overflow-y-auto scrollbar-thin"
  >
    <div class="flex pb-4">
      <div class="text-3xl font-semibold w-full text-left ml-2">
        {credential.name}
      </div>
      <button
        class="p-2 mr-3 rounded-lg {$showEditCredentialDialog
          ? 'bg-osvauld-sensitivebgblue'
          : ''}"
        on:click={() => {
          showEditCredentialDialog.set(true);
          showCredentialEditor.set(true);
          showCredentialDetailsDrawer.set(false);
        }}
      >
        <EditIcon />
      </button>
      <button
        class="p-2"
        on:click={() => showCredentialDetailsDrawer.set(false)}
        ><ClosePanel /></button
      >
    </div>
    <div class="flex justify-start items-center mb-12">
      <button
        on:click={() => (accessListSelected = false)}
        class="p-2 font-medium border-transparent text-osvauld-chalkwhite mr-2 {!accessListSelected &&
          'border-2 border-b-osvauld-carolinablue text-osvauld-plainwhite'}"
        >Details</button
      >
      <button
        on:click={() => (accessListSelected = true)}
        class="p-2 font-medium border-transparent text-osvauld-chalkwhite {accessListSelected &&
          'border-2 border-b-osvauld-carolinablue text-osvauld-plainwhite'}"
        >Access List</button
      >
    </div>
    <div class="border border-osvauld-iconblack rounded-xl p-3">
      {#if !accessListSelected}
        {#each credential.fields as field}
          <PlainField
            fieldName={field.fieldName}
            fieldValue={field.fieldValue}
            hoverEffect={true}
            bgColor={"#0D1117"}
          />
        {/each}
        {#if sensitiveFields}
          {#each sensitiveFields as field}
            <EncryptedField
              fieldName={field.fieldName}
              fieldValue={field.fieldValue}
              hoverEffect={true}
              bgColor={"#0D1117"}
            />
          {/each}
        {/if}
        <label
          class="text-osvauld-dusklabel block text-left text-sm font-normal"
          for="credential-description"
        >
          Description
        </label>
        <div
          class="mt-4 w-full h-[4rem] py-1 px-2 overflow-y-scroll bg-osvauld-frameblack rounded-lg text-left scrollbar-thin border border-osvauld-iconblack resize-none text-basetext-osvauld-quarzowhite"
          id="credential-description"
        >
          {credential.description}
        </div>
      {:else}
        <div class="flex justify-between items-center">
          <UserGroupToggle on:select={toggleSelect} />
          <button
            class="p-2 mr-3 rounded-lg {accessEdit
              ? 'bg-osvauld-sensitivebgblue'
              : ''}"
            on:click={() => {
              accessEdit = !accessEdit;
            }}
          >
            <EditIcon />
          </button>
        </div>
        <div class="items-left">
          {#if selectedTab == "Groups"}
            {#each groups as group}
              <ExistingListItem
                item={group}
                on:remove={() => removeGroupFromCredentialHandler(group)}
                on:permissonChange={(e) =>
                  permissionChangeHandler(e, group.groupId, "group")}
              />
            {/each}
          {:else if selectedTab == "Users"}
            {#each users as user}
              <ExistingListItem
                item={user}
                on:remove={() => removeUserFromCredentialHandler(user)}
                on:permissonChange={(e) =>
                  permissionChangeHandler(e, user.id, "user")}
              />
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
