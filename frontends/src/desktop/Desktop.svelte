<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import { onMount, onDestroy } from "svelte";
	import { sendMessage } from "../lib/components/dashboard/helper";
	let connectionTicket = "";
	let status = "Initializing...";
	let error = "";
	let peerStatus = new Set();
	let messages: { text: string; sent: boolean }[] = [];
	let messageInput = "";
	let unlistenHandlers: (() => void)[] = [];

	async function setupEventListeners() {
		// Listen for peer connection attempts
		const unlisten1 = await listen("peer-connected", () => {
			status = "Mobile device trying to connect...";
		});

		// Listen for successful connection establishment
		const unlisten2 = await listen("sync-complete", () => {
			status = "Mobile device connected successfully";
		});

		// Listen for disconnection
		const unlisten3 = await listen("peer-down", (event) => {
			peerStatus.delete(event.payload);
			peerStatus = peerStatus; // trigger reactivity
			status = "Mobile device disconnected";
		});

		// Listen for incoming messages
		const unlisten4 = await listen("message-received", (event: any) => {
			messages = [...messages, { text: event.payload, sent: false }];
		});

		unlistenHandlers.push(unlisten1, unlisten2, unlisten3, unlisten4);
	}

	onMount(async () => {
		try {
			await invoke("start_p2p_listener");
			await setupEventListeners();
			connectionTicket = await invoke("get_ticket");
			const certificate = await sendMessage("exportCertificate", {
				passphrase: "test",
			});
			console.log("Certificate:", certificate);
			status = "Ready to connect. Share the ticket with mobile device.";
		} catch (err) {
			error = err.toString();
			status = "Failed to initialize";
			console.error("Error generating ticket:", err);
		}
	});

	onDestroy(() => {
		// Clean up event listeners
		unlistenHandlers.forEach((unlisten) => unlisten());
	});

	async function copyTicket() {
		try {
			await navigator.clipboard.writeText(connectionTicket);
			const originalStatus = status;
			status = "Ticket copied to clipboard!";
			setTimeout(() => {
				status = originalStatus;
			}, 2000);
		} catch (err) {
			error = "Failed to copy ticket";
			console.error("Copy error:", err);
		}
	}

	async function sendMessageChat() {
		if (!messageInput.trim()) return;

		try {
			await invoke("send_message", { message: messageInput });
			messages = [...messages, { text: messageInput, sent: true }];
			messageInput = "";
		} catch (err) {
			error = "Failed to send message: " + err.toString();
			console.error("Send error:", err);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			sendMessageChat();
		}
	}
</script>

<main class="container p-4 mx-auto">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-2xl font-bold mb-4">Desktop Connection</h1>

		<div class="mb-4">
			<p class="font-semibold">
				Status: <span
					class="px-2 py-1 rounded"
					class:text-blue-600="{status.includes('Ready')}"
					class:text-yellow-600="{status.includes('trying')}"
					class:text-green-600="{status.includes('successfully')}"
					class:text-red-600="{status.includes('Failed') ||
						status.includes('disconnected')}">{status}</span>
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

		{#if connectionTicket}
			<div class="bg-gray-100 p-4 rounded mb-4">
				<h2 class="font-semibold mb-2">Your Connection Ticket:</h2>
				<div class="bg-white p-3 rounded break-all mb-2 font-mono text-sm">
					{connectionTicket}
				</div>
				<button
					class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
					on:click="{copyTicket}"
					disabled="{!connectionTicket}">
					Copy Ticket
				</button>
			</div>
		{/if}

		<!-- Messages Section -->
		<div class="mt-6">
			<h2 class="font-semibold mb-2">Messages</h2>
			<div
				class="bg-white border rounded-lg p-4 h-96 overflow-y-auto flex flex-col gap-2 mb-4">
				{#each messages as message}
					<div
						class="p-2 rounded-lg max-w-[80%] {message.sent
							? 'bg-blue-500 text-white ml-auto'
							: 'bg-gray-100 mr-auto'}">
						{message.text}
					</div>
				{/each}
			</div>

			<div class="flex gap-2">
				<textarea
					class="flex-1 p-2 border rounded resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
					rows="2"
					placeholder="Type your message..."
					bind:value="{messageInput}"
					on:keypress="{handleKeyPress}"></textarea>
				<button
					class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
					on:click="{sendMessageChat}"
					disabled="{!messageInput.trim()}">
					Send
				</button>
			</div>
		</div>

		{#if peerStatus.size > 0}
			<div class="mt-4">
				<h2 class="font-semibold mb-2">Connected Devices:</h2>
				<ul class="list-disc pl-5">
					{#each [...peerStatus] as peer}
						<li class="text-gray-700">{peer}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</main>
