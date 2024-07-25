<script lang="ts">
	import { createGroup, renameGroup } from "../apis";
	import {
		selectedGroup,
		showAddGroupDrawer,
		showRenameGroupDrawer,
	} from "../store";
	import ClosePanel from "../../basic/icons/closePanel.svelte";
	import { groupStore, toastStore } from "../store";
	import { setGroupStore } from "../../../store/storeHelper";
	export let name: string = "";
	export let rename: boolean = false;

	const renameGroupFunc = async () => {
		const payload = {
			name: name,
		};
		if ($selectedGroup === null) {
			showRenameGroupDrawer.set(false);
			throw new Error("Group not selected");
		}
		const groupResponse = await renameGroup(payload, $selectedGroup.groupId);

		await setGroupStore();
		const actionMessage = groupResponse.success
			? "Group Successfully Renamed"
			: "Failed to Rename group";
		toastStore.set({
			type: groupResponse.success,
			message: actionMessage,
			show: true,
		});
		showRenameGroupDrawer.set(false);
	};

	const addGroupFunc = async () => {
		const payload = {
			name: name,
		};
		const groupResponse = await createGroup(payload);

		await setGroupStore();
		for (const group of $groupStore) {
			if (group.groupId === groupResponse.data.groupId) {
				selectedGroup.set(group);
				break;
			}
		}
		showAddGroupDrawer.set(false);
		const actionMessage = groupResponse.success
			? "Group Successfully Created"
			: "Failed to Create group";
		toastStore.set({
			type: groupResponse.success,
			message: actionMessage,
			show: true,
		});
	};

	function autofocus(node: any) {
		node.focus();
	}

	const handleClose = () => {
		showAddGroupDrawer.set(false);
		showRenameGroupDrawer.set(false);
	};
</script>

<form
	class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[32rem] h-[17rem] flex flex-col items-start justify-center gap-3"
	on:submit|preventDefault="{rename ? renameGroupFunc : addGroupFunc}"
>
	<div class="flex justify-between items-center w-full">
		<span class="text-[21px] font-medium text-osvauld-quarzowhite"
			>{rename ? "Rename Group" : "Create Group"}</span
		>
		<button
			class="cursor-pointer p-2"
			on:click|preventDefault="{handleClose}"
			type="button"
		>
			<ClosePanel />
		</button>
	</div>
	<div
		class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
	></div>

	<label for="name" class="font-bold text-base text-osvauld-textActive"
		>Name:</label
	>
	<input
		id="name"
		type="text"
		use:autofocus
		required
		bind:value="{name}"
		class="py-1 rounded-md items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-input"
		autocomplete="off"
	/>

	<div
		class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
	></div>

	<div class="flex justify-end items-center gap-4 w-full">
		<button
			class="text-osvauld-fadedCancel font-medium text-base py-[5px] px-[15px] rounded-md hover:text-osvauld-quarzowhite hover:bg-osvauld-cancelBackground"
			on:click|preventDefault="{handleClose}"
			type="button">Cancel</button
		>
		<button
			class="border border-osvauld-iconblack py-[5px] px-[15px] text-base font-medium text-osvauld-textActive rounded-md hover:bg-osvauld-carolinablue hover:border-osvauld-carolinablue hover:text-osvauld-frameblack"
			type="submit"
			disabled="{name === ''}"
		>
			{rename ? "Save Changes" : "Add Group"}
		</button>
	</div>
</form>
