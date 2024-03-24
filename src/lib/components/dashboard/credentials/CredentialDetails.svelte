<script lang="ts">
  import { fly } from "svelte/transition";
  import EncryptedField from "./EncryptedField.svelte";
  import PlainField from "./PlainField.svelte";
  import UserGroupToggle from "../UserGroupToggle.svelte";
  import ShareToast from "../components/ShareToast.svelte";
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
    editPermissionTrigger,
    isPermissionChanged,
    accessSelectorIdentifier,
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
  import Tick from "../../basic/icons/tick.svelte";
  export let credential: Credential;
  export let sensitiveFields: Fields[];
  let selectedTab = "Groups";
  let accessListSelected = false;
  let accessChangeDetected = false;
  let permissionChangeAttemptMessage = "";
  let changeToast = false;

  let userPermissions: {
    credentialId: string;
    userId: string;
    accessType: string;
  };
  let groupPermissions: {
    credentialId: string;
    groupId: string;
    accessType: string;
  };
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

  const savePermissions = async () => {
    if (Object.keys(userPermissions).length !== 0) {
      const userPermissionSaveResponse = await editUserPermissionForCredential(
        userPermissions.credentialId,
        userPermissions.userId,
        userPermissions.accessType
      );
      await toggleSelect({ detail: "Users" });
      accessChangeDetected = false;
      changeToast = true;
      permissionChangeAttemptMessage = userPermissionSaveResponse.message
        ? userPermissionSaveResponse.message
        : "Does not have access";
    } else if (Object.keys(groupPermissions).length !== 0) {
      const groupPermissionSaveResponse =
        await editGroupPermissionForCredential(
          groupPermissions.credentialId,
          groupPermissions.groupId,
          groupPermissions.accessType
        );
      await toggleSelect({ detail: "Groups" });
      accessChangeDetected = false;
      changeToast = true;
      permissionChangeAttemptMessage = groupPermissionSaveResponse.message
        ? groupPermissionSaveResponse.message
        : "Does not have access";
    }
    accessChangeDetected = false;
  };

  const permissionChangeHandler = async (e: any, id: string, type: string) => {
    accessChangeDetected = true;
    accessSelectorIdentifier.set(null);
    if (type == "user") {
      userPermissions = {
        credentialId: credential.credentialId,
        userId: id,
        accessType: e.detail,
      };
    } else {
      groupPermissions = {
        credentialId: credential.credentialId,
        groupId: id,
        accessType: e.detail,
      };
    }
  };

  onMount(async () => {
    // @ts-ignore
    credentialIdForEdit.set(credential.credentialId);
    const groupsResponse = await fetchCredentialGroups(credential.credentialId);
    groups = groupsResponse.data;

    console.log("Credential data from details =>", credential);
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
    <div class="flex justify-start items-center mb-6">
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
            bgColor={null}
          />
        {/each}
        {#if sensitiveFields}
          {#each sensitiveFields as field}
            <EncryptedField
              fieldName={field.fieldName}
              fieldValue={field.fieldValue}
              hoverEffect={true}
              bgColor={null}
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
          class="mt-4 w-full h-[4rem] py-1 px-2 overflow-y-scroll bg-osvauld-frameblack rounded-lg text-left scrollbar-thin border border-osvauld-iconblack resize-none text-base text-osvauld-quarzowhite"
          id="credential-description"
        >
          {credential.description}
        </div>
      {:else}
        <div class="flex justify-between items-center">
          <UserGroupToggle on:select={toggleSelect} />
          <div class="mr-3">
            {#if accessChangeDetected}
              <button
                class="p-2 mr-1 rounded-lg bg-osvauld-sensitivebgblue"
                on:click={() => {
                  savePermissions();
                  accessChangeDetected = !accessChangeDetected;
                }}
              >
                <Tick />
              </button>
            {/if}
            <button
              class="p-2 rounded-lg {$editPermissionTrigger
                ? 'bg-osvauld-sensitivebgblue'
                : ''}"
              on:click={() => {
                editPermissionTrigger.set(!$editPermissionTrigger);
                isPermissionChanged.set(false);
                accessSelectorIdentifier.set(null);
              }}
            >
              <EditIcon />
            </button>
          </div>
        </div>
        <div class="items-left">
          {#if selectedTab == "Groups"}
            {#each groups as group, index}
              <ExistingListItem
                item={group}
                {index}
                on:remove={() => removeGroupFromCredentialHandler(group)}
                on:permissonChange={(e) =>
                  permissionChangeHandler(e, group.groupId, "group")}
              />
            {/each}
          {:else if selectedTab == "Users"}
            {#each users as user, index}
              <ExistingListItem
                item={user}
                {index}
                on:remove={() => removeUserFromCredentialHandler(user)}
                on:permissonChange={(e) =>
                  permissionChangeHandler(e, user.id, "user")}
              />
            {/each}
          {/if}
          {#if changeToast}
            <ShareToast
              message={permissionChangeAttemptMessage}
              on:close={() => (changeToast = !changeToast)}
            />
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
