<script lang="ts">
  import { slide } from "svelte/transition";

  import FolderEditor from "./FolderEditor.svelte";

  import {
    showAddFolderDrawer,
    folderStore,
    selectedFolder,
    buttonRef,
    showMoreOptions,
    modalManager,
    credentialStore,
    envStore,
    selectedEnv,
    selectedSection,
    showFolderRenameDrawer,
  } from "../store";

  import { Folder } from "../dtos";
  import { Menu, FolderIcon, Add, RightArrow } from "../icons";
  import { onMount } from "svelte";
  import { setFolderStore, setEnvStore } from "../../../store/storeHelper";
  import FolderAdd from "../../basic/icons/folderAdd.svelte";
  import EnvironmentAdd from "../../basic/icons/environmentAdd.svelte";
  import Environments from "../credentials/Environments.svelte";
  import ExistingEnvironment from "../../basic/icons/existingEnvironment.svelte";
  import { cubicIn } from "svelte/easing";
  let iconColor = "#6E7681";
  let hoveringIndex = null;
  let hoveringEnvIndex = null;

  const selectFolder = async (folder: Folder) => {
    selectedFolder.set(folder);
    selectedEnv.set(null);
    selectedSection.set("SharedFolders");
  };

  const openModal = () => {
    showAddFolderDrawer.set(true);
  };

  const closeModal = () => {
    showAddFolderDrawer.set(false);
  };

  const openFolderMenu = (e, folderId: string, folderName: string) => {
    buttonRef.set(e.currentTarget);
    modalManager.set({ id: folderId, name: folderName, type: "Folder" });
    showMoreOptions.set(true);
  };

  const selectEnv = (env) => {
    selectedEnv.set(env);
    selectedFolder.set(null);
    selectedSection.set("Environments");
    credentialStore.set([]);
  };

  const selectSection = (section) => {
    selectedSection.set(section);
    selectedFolder.set(null);
    selectedEnv.set(null);
    credentialStore.set([]);
  };

  onMount(async () => {
    await setFolderStore();
    await setEnvStore();
    selectSection("SharedFolders");
  });
</script>

<div class="h-full w-full flex flex-col justify-start items-center">
  <button
    class="w-[90%] bg-osvauld-frameblack border border-osvauld-iconblack text-osvauld-sheffieldgrey hover:bg-osvauld-carolinablue hover:text-osvauld-ninjablack whitespace-nowrap rounded-lg py-1.5 px-2 mb-4 flex justify-center items-center"
    on:mouseenter={() => (iconColor = "#000")}
    on:mouseleave={() => (iconColor = "#6E7681")}
    on:click={openModal}
  >
    <span class="mr-1 text-base font-normal">Create new folder</span>
    <Add color={iconColor} />
  </button>
  {#if $showAddFolderDrawer || $showFolderRenameDrawer}
    <button
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-[2px]"
      on:click={closeModal}
    >
      <button class="p-6 rounded" on:click|stopPropagation>
        <FolderEditor />
      </button>
    </button>
  {/if}
  <div class="border-b border-osvauld-iconblack my-1 w-[90%]"></div>
  <!-- <button
    on:click={() => selectSection("SharedFolders")}
    class="text-white w-[90%] py-2 flex justify-between items-center px-2 rounded-md {$selectedSection ===
    'SharedFolders'
      ? 'bg-osvauld-sideListHighlight'
      : ''}"
    >Shared Folders <span class="flex"
      ><FolderAdd />
      <span
        class={$selectedSection === "SharedFolders"
          ? "rotate-90 transition-all"
          : "rotate-0"}
      >
        <RightArrow />
      </span>
    </span>
  </button> -->
  <ul
    class="overflow-y-scroll w-[90%] overflow-x-hidden scrollbar-thin min-h-[8rem] -pl-3"
  >
    {#each $folderStore as folder, index}
      <li
        class="{$selectedFolder?.id == folder.id
          ? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
          : 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center"
        on:mouseenter={() => (hoveringIndex = index)}
        on:mouseleave={() => (hoveringIndex = null)}
      >
        <button
          on:click={() => selectFolder(folder)}
          class="w-full p-2 text-lg rounded-2xl flex items-center cursor-pointer"
        >
          <FolderIcon
            color={$selectedFolder?.id == folder.id || hoveringIndex === index
              ? "#F2F2F0"
              : "#85889C"}
          />
          <span
            class="ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap text-left inline-block w-[8rem] {$selectedFolder?.id ==
              folder.id || hoveringIndex === index
              ? 'text-osvauld-sideListTextActive'
              : 'text-osvauld-fieldText'}"
            >{folder.name}
            <span
              class="ml-2 text-osvauld-fieldText font-light {$selectedFolder?.id ===
              folder.id
                ? 'visible delay-200'
                : 'invisible'}">{$credentialStore.length}</span
            ></span
          >
          <div
            class="relative z-100 ml-auto flex justify-center items-center {$selectedFolder?.id ==
              folder.id || hoveringIndex === index
              ? 'visible'
              : 'invisible'}"
          >
            {#if folder.accessType === "manager"}
              <button
                class="p-2"
                on:click={(e) => {
                  openFolderMenu(e, folder.id, folder.name);
                }}
              >
                <Menu />
              </button>
            {/if}
          </div>
        </button>
      </li>
    {/each}
  </ul>
  <!-- <div class="border-b border-osvauld-iconblack my-1 w-[90%]"></div>
  <button
    on:click={() => selectSection("PrivateFolders")}
    class="text-white w-[90%] py-2 flex justify-between items-center px-2 rounded-md {$selectedSection ===
    'PrivateFolders'
      ? 'bg-osvauld-sideListHighlight'
      : ''}"
    >Private Folders <span class="flex"
      ><FolderAdd />
      <span
        class={$selectedSection === "PrivateFolders"
          ? "rotate-90 transition-all"
          : "rotate-0"}
      >
        <RightArrow />
      </span>
    </span>
  </button>
  <ul
    class="overflow-y-scroll w-full overflow-x-hidden scrollbar-thin -pl-3 mx-auto"
  ></ul> -->
  <div class="border-b border-osvauld-iconblack my-1 w-[90%] mt-auto"></div>
  <button
    on:click={() =>
      selectSection(
        $selectedSection === "Environments" ? "SharedFolders" : "Environments"
      )}
    class="w-[90%] py-2 flex justify-between items-center px-2 rounded-md {$selectedSection ===
    'Environments'
      ? 'bg-osvauld-sideListHighlight text-osvauld-sideListTextActive'
      : 'text-osvauld-fieldText'}"
    >Environments <span class="flex"
      ><EnvironmentAdd
        color={$selectedSection === "Environments" ? "#F2F2F0" : "#85889C"}
      />
      <span
        class={$selectedSection === "Environments"
          ? "rotate-90 transition-all"
          : "rotate-0"}
      >
        <RightArrow
          color={$selectedSection === "Environments" ? "#F2F2F0" : "#85889C"}
        />
      </span>
    </span>
  </button>
  {#if $selectedSection === "Environments"}
    <div class="w-[90%]" transition:slide={{ delay: 0, duration: 100 }}>
      <ul
        class="overflow-y-scroll w-full overflow-x-hidden scrollbar-thin min-h-[4rem] max-h-[8.5rem] pl-0"
      >
        {#each $envStore as env, index}
          <li
            class="{$selectedEnv?.id == env.id
              ? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
              : 'hover:bg-osvauld-fieldActive text-osvauld-fieldText'} 
          rounded-md my-1 pl-3 pr-3 mr-1 flex items-center transition-colors duration-0 ease-in"
            on:mouseenter={() => (hoveringEnvIndex = index)}
            on:mouseleave={() => (hoveringEnvIndex = null)}
          >
            <button
              on:click={() => {
                selectEnv(env);
              }}
              class="w-full p-2 text-lg rounded-2xl flex items-center"
            >
              <ExistingEnvironment
                color={$selectedEnv?.id == env.id || hoveringEnvIndex === index
                  ? "#F2F2F0"
                  : "#85889C"}
              />
              <span
                class="ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap text-left inline-block w-[8rem] {$selectedEnv?.id ==
                  env.id || hoveringEnvIndex === index
                  ? 'text-osvauld-sideListTextActive'
                  : 'text-osvauld-fieldText'}"
                >{env.name}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
