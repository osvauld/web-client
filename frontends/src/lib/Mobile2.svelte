<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import { onMount, onDestroy } from "svelte";

	let status = "Ready to connect";
	let error = "";
	let ticket = "";
	let connected = false;
	let connecting = false;
	let peerStatus = new Set();
	let unlistenHandlers: (() => void)[] = [];

	async function setupEventListeners() {
		// Listen for initial connection establishment
		const unlisten1 = await listen("peer-connected", () => {
			status = "Establishing secure connection...";
		});

		// Listen for successful connection completion
		const unlisten2 = await listen("sync-complete", () => {
			status = "Connected successfully";
			connected = true;
			connecting = false;
		});

		// Listen for disconnection
		const unlisten3 = await listen("peer-down", (event) => {
			peerStatus.delete(event.payload);
			peerStatus = peerStatus; // trigger reactivity
			status = "Disconnected from desktop2";
			connected = false;
		});

		unlistenHandlers.push(unlisten1, unlisten2, unlisten3);
	}

	onMount(async () => {
		try {
			await setupEventListeners();
		} catch (err) {
			error = err.toString();
			console.error("Error setting up event listeners:", err);
		}
	});

	onDestroy(() => {
		// Clean up event listeners
		unlistenHandlers.forEach((unlisten) => unlisten());
	});

	async function connect() {
		if (!ticket.trim()) {
			error = "Please enter a connection ticket";
			return;
		}

		try {
			status = "Initiating connection...";
			error = "";
			connecting = true;

			await invoke("connect_with_ticket", { ticket: ticket.trim() });
			// The event listeners will handle further status updates
		} catch (err) {
			const errorMsg = err.toString();
			error = errorMsg;
			status = errorMsg.includes("handshake")
				? "Connection established but handshake failed"
				: "Connection failed";
			connecting = false;
			connected = false;
			console.error("Connection error:", err);
		}
	}

	async function disconnect() {
		// TODO: Implement disconnect functionality
		connected = false;
		status = "Disconnected";
		ticket = "";
	}

	async function pasteTicket() {
		try {
			const text = await navigator.clipboard.readText();
			ticket = text;
			error = ""; // Clear any previous errors
		} catch (err) {
			error = "Failed to paste from clipboard";
			console.error("Paste error:", err);
		}
	}
</script>

<main class="container p-4 mx-auto">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-2xl font-bold mb-4">Mobile Connection</h1>

		<div class="mb-4">
			<p class="font-semibold">
				Status: <span
					class="px-2 py-1 rounded"
					class:text-blue-600="{!connected && !connecting}"
					class:text-yellow-600="{connecting}"
					class:text-green-600="{connected}"
					class:text-red-600="{status.includes('failed') ||
						status.includes('Disconnected')}">{status}</span>
			</p>
		</div>

		{#if error}
			<div
				class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start justify-between">
				<div>
					<strong class="font-bold">Error: </strong>
					<span class="block sm:inline">{error}</span>
				</div>
				<button class="ml-4 font-bold" on:click="{() => (error = '')}"
					>×</button>
			</div>
		{/if}

		{#if !connected}
			<div class="space-y-4">
				<div class="flex gap-2">
					<input
						type="text"
						placeholder="Enter connection ticket"
						class="flex-1 p-2 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						bind:value="{ticket}"
						disabled="{connecting}" />
					<button
						class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-400"
						on:click="{pasteTicket}"
						disabled="{connecting}">
						Paste
					</button>
				</div>

				<button
					class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
					on:click="{connect}"
					disabled="{connecting || !ticket.trim()}">
					{#if connecting}
						<span class="inline-flex items-center">
							<svg
								class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Connecting...
						</span>
					{:else}
						Connect
					{/if}
				</button>
			</div>
		{:else}
			<div class="mt-4">
				<button
					class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
					on:click="{disconnect}">
					Disconnect
				</button>
			</div>
		{/if}

		{#if connected && peerStatus.size > 0}
			<div class="mt-4">
				<h2 class="font-semibold mb-2">Connected To:</h2>
				<ul class="list-disc pl-5">
					{#each [...peerStatus] as peer}
						<li class="text-gray-700">{peer}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</main>
