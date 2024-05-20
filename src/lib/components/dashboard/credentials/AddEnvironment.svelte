<script lang="ts">
	import { fetchCliUsers, addEnvironment } from "../apis";
	import { onMount, createEventDispatcher } from "svelte";
	import { showAddEnvDrawer } from "../store";
	import { ClosePanel, Lens, UserCheck, UserPlus } from "../icons";
	import { setEnvStore } from "../../../store/storeHelper";

	let name = "";
	let selectedUser = null;
	let cliUsers = [];
	let query = "";
	let searchResults = [];
	let hoveredIndex = null;
	let selectedUserIndice = null;

	const dispatch = createEventDispatcher();

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			dispatch("close");
		}
	};

	const handleInputChange = (e: any) => {
		const query = e.target.value;
		searchResults =
			query.length === 0
				? cliUsers
				: cliUsers.filter((item) => item.username.startsWith(query));
	};

	const addUsertoGroup = async (user, index) => {
		selectedUserIndice = index;
		selectedUser = user;
	};

	const addEnvironmentHandler = async () => {
		await addEnvironment(name, selectedUser.id);
		showAddEnvDrawer.set(false);
		setEnvStore();
	};

	function autofocus(node: any) {
		node.focus();
	}

	const handleClose = () => {
		showAddEnvDrawer.set(false);
	};

	onMount(async () => {
		const response = await fetchCliUsers();
		searchResults = cliUsers = response.data;
	});
</script>

<form
	class="p-4 bg-osvauld-frameblack border border-osvauld-activeBorder rounded-3xl w-[35rem] h-[36rem] flex flex-col items-start justify-center gap-3"
	on:submit|preventDefault="{addEnvironmentHandler}"
>
	<div class="flex justify-between items-center w-full">
		<span class="text-[21px] font-medium text-osvauld-quarzowhite"
			>Create Environment</span
		>
		<button
			class="cursor-pointer p-2"
			on:click|preventDefault="{handleClose}"
		>
			<ClosePanel />
		</button>
	</div>
	<div
		class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
	></div>

	<label for="name" class="font-normal text-base text-osvauld-textActive"
		>Name</label
	>
	<input
		id="name"
		type="text"
		use:autofocus
		required
		bind:value="{name}"
		class="py-1 rounded-md items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-8 mx-2 focus:border-osvauld-iconblack focus:ring-0 form-input"
		autocomplete="off"
	/>
	<label for="name" class="font-light text-base text-osvauld-textActive"
		>Add one CLI user to the environment</label
	>
	<div
		class="h-8 w-[95%] px-2 mx-2 mb-2 py-1 flex justify-start items-center border border-osvauld-iconblack focus-within:border-osvauld-activeBorder rounded-lg cursor-pointer"
	>
		<span class="w-4 h-4"><Lens /></span>
		<input
			type="text"
			class="h-full w-full bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-base focus:border-transparent focus:ring-0 cursor-pointer"
			placeholder="Search.."
			on:input="{handleInputChange}"
			bind:value="{query}"
			on:keyup="{handleKeyDown}"
		/>
	</div>
	<div
		class="min-h-[10rem] max-h-[14rem] overflow-y-scroll scrollbar-thin flex flex-col justify-start items-center w-[95%] px-1"
	>
		{#each searchResults as user, index}
			<label
				class="w-full px-2 py-1.5 text-left rounded-md cursor-pointer text-osvauld-textActive hover:bg-osvauld-fieldActive hover:shadow-[0_0_0_1px_#292A36] flex justify-between items-center"
				on:mouseenter="{() => (hoveredIndex = index)}"
				on:mouseleave="{() => (hoveredIndex = null)}"
			>
				<!-- <input type="radio" bind:group={selectedUser} value={user} /> -->
				<span class="pl-1">{user.username}</span>
				<button
					class="p-1 relative"
					type="button"
					on:click="{() => addUsertoGroup(user, index)}"
				>
					{#if selectedUserIndice === index}
						<UserCheck />
					{:else}
						<span
							class="{hoveredIndex === index
								? 'visible'
								: 'invisible'}"
						>
							<UserPlus />
						</span>
					{/if}
				</button>
			</label>
		{/each}
	</div>
	<div
		class="border-b border-osvauld-iconblack w-[calc(100%+2rem)] -translate-x-4"
	></div>

	<div class="flex justify-end items-center gap-6 w-full">
		<button
			class="text-osvauld-fadedCancel font-medium text-base"
			on:click|preventDefault="{handleClose}">Cancel</button
		>
		<button
			class="border border-osvauld-iconblack py-[5px] px-[15px] text-base font-normal text-osvauld-textActive rounded-md"
			type="submit"
			disabled="{name === '' || selectedUser === null}"
		>
			Create Environment
		</button>
	</div>
</form>
