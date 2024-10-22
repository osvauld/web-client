<script lang="ts">
	import browser from "webextension-polyfill";
	import { onMount, onDestroy } from "svelte";
	import { Maximize, Lens } from "./icons";
	import { Credential } from "../../dtos/credential.dto";
	import { sendMessage } from "../dashboard/helper";
	import { searchObjects } from "../dashboard/helper";
	import { SearchedCredential } from "../../dtos/credential.dto";
	import ListedCredentials from "./components/ListedCredentials.svelte";
	import PasswordNotFound from "./components/PasswordNotFound.svelte";
	import AddCredential from "./AddCredential.svelte";
	import { Add } from "./icons";
	import PasswordGenerator from "./PasswordGenerator.svelte";
	import { LocalStorageService } from "../../../scripts/storageHelper";
	type ListedCredential = {
		description: string;
		domain: string;
		folderId: string;
		credentialId: string;
		name: string;
	};
	let passwordFound = false;
	let credentialClicked = false;
	let domain: string | null = null;
	let listedCredentials: ListedCredential[] = [];
	let domainAssociatedCredentials: ListedCredential[] = [];
	let selectedCredentialId: string | null = null;
	let searchData: SearchedCredential[] = [];
	let query: string | null = null;
	let scrollPosition = 0;
	let clickedCredential: any | null = null;
	let scrollableElement: any;
	let passwordGenerator = false;
	let showAddOptions = false;
	let currentUrl = "";
	let port: browser.Runtime.Port;
	let addNewCredential = false;
	let storedCredentialId: string | null = null;
	let newCredential: any | null = {
		username: "",
		password: "",
		domain: "",
		windowId: "",
	};
	const openFullscreenTab = async () => {
		await sendMessage("openFullscreenTab");
	};

	const readDomain = async () => {
		const tabs = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});
		const activeTab = tabs[0];
		if (activeTab && activeTab.url) {
			currentUrl = activeTab.url;
			const url = new URL(activeTab.url);
			const hostname = url.hostname;
			const parts = hostname.split(".");
			if (parts.length > 2) {
				domain = parts.slice(-2).join(".");
			} else if (hostname === browser.runtime.id) {
				domain = "Dashboard";
			} else {
				domain = hostname;
			}
		}
	};

	const fetchCredentialsOfCurrentDomin = async () => {
		// const responseJson = await fetchAllUserUrls();
		// const urls = responseJson.data;
		// await readDomain();
		// const { credIds } = await sendMessage("updateAllUrls", {
		// 	urls,
		// 	domain,
		// });
		// if (credIds.length > 0) {
		// 	passwordFound = true;
		// 	const responseJson = await fetchCredsByIds(credIds);
		// 	listedCredentials = responseJson.data;
		// }
	};
	onMount(async () => {
		query = LocalStorageService.get("query");
		if (query && query.length >= 1) {
			await prepareSearchData();
			listedCredentials = searchObjects(query, searchData);
		} else {
			await fetchCredentialsOfCurrentDomin();
		}
		// const user = await getUser();
		// LocalStorageService.set("user", user.data, true);
		// storedCredentialId = LocalStorageService.get("selectedCredentialId");
		const storedScrollPosition: any = LocalStorageService.get("scrollPosition");
		if (storedScrollPosition !== null) {
			scrollPosition = parseInt(storedScrollPosition);
			scrollableElement.scrollTop = scrollPosition;
		}
		port = browser.runtime.connect({ name: "popup" });
		port.onMessage.addListener(handleMessage);
	});

	const handleMessage = (msg: { username: string; password: string }) => {
		if (msg.username && msg.password) {
			newCredential = msg;
			addNewCredential = true;
		}
	};

	onDestroy(() => {
		port.disconnect();
		port.onMessage.removeListener(handleMessage);
	});

	const prepareSearchData = async () => {
		// const searchFieldSResponse = await getSearchFields();
		// searchData = searchFieldSResponse.data;
		// const urlJson = await fetchAllUserUrls();
		// const urls = urlJson.data;
		// const decryptedData: { credentialId: string; value: string }[] =
		// 	await sendMessage("getDecryptedUrls", urls);
		// const mergedArray = searchData.map((item) => {
		// 	const replacement = decryptedData.find(
		// 		(decryptedItem) => decryptedItem.credentialId === item.credentialId,
		// 	);
		// 	if (replacement) {
		// 		return { ...item, domain: replacement.value };
		// 	}
		// 	return item;
		// });
		// searchData = mergedArray;
	};

	const handleInputChange = async (e: any) => {
		const query = e.target.value;
		if (query.length >= 1) {
			if (searchData.length === 0) {
				await prepareSearchData();
			}
			passwordFound = false;
			listedCredentials = searchObjects(query, searchData);
		} else {
			listedCredentials = [];
			await fetchCredentialsOfCurrentDomin();
		}
		LocalStorageService.set("query", query);
	};

	const selectCredential = async (e: any) => {
		storedCredentialId = e.detail.credentialId;
	};
	const handleScroll = async (e: any) => {
		scrollPosition = e.target.scrollTop;
		LocalStorageService.set("scrollPosition", scrollPosition.toString());
	};

	const addCredentialManual = async () => {
		showAddOptions = false;
		addNewCredential = true;
	};

	const closeAddCredential = async () => {
		addNewCredential = false;
		await fetchCredentialsOfCurrentDomin();
	};

	const handleOptionsClick = () => {
		showAddOptions = !showAddOptions;
	};

	const triggerPasswordGenerator = () => {
		showAddOptions = false;
		passwordGenerator = true;
	};
</script>

<div class="w-full h-full px-2 relative">
	<div class="flex justify-between items-center mb-3 py-0">
		<h6 class="text-2xl font-medium text-osvauld-fieldText tracking-wide">
			osvauld
		</h6>
		<div>
			<button class="" on:click="{openFullscreenTab}">
				<Maximize />
			</button>
		</div>
	</div>

	<div class="w-full h-[90%] overflow-hidden">
		{#if !addNewCredential && !passwordGenerator}
			<div
				class="text-osvauld-highlightwhite mb-3 flex justify-between items-center text-sm">
				<span class="text-base text-osvauld-carolinablue">
					{#if domain}
						{domain}
					{/if}
				</span>
				<span
					class="text-osvauld-sheffieldgrey {passwordFound
						? 'visible'
						: 'invisible'}">
					{domainAssociatedCredentials.length}
				</span>
			</div>

			<div
				class="h-9 w-full mx-auto flex justify-start items-center border focus-within:!border-osvauld-activeBorder border-osvauld-iconblack rounded-lg cursor-pointer mb-4 pl-2">
				<Lens />
				<input
					type="text"
					class="h-6 w-[70%] bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-sm font-light focus:border-transparent focus:ring-0 cursor-pointer"
					placeholder="Find what you need faster.."
					on:keyup="{handleInputChange}"
					bind:value="{query}" />
			</div>
		{/if}
		<div class="h-full p-0 scrollbar-thin">
			{#if !addNewCredential}
				<div
					class="border-b border-osvauld-darkLineSeperator mb-1 w-[calc(100%+1.5rem)] -translate-x-3">
				</div>
			{/if}
			<div
				class="h-[32rem] overflow-y-scroll scrollbar-thin pt-3"
				on:scroll="{handleScroll}"
				bind:this="{scrollableElement}">
				{#if addNewCredential}
					<AddCredential
						username="{newCredential.username}"
						password="{newCredential.password}"
						domain="{newCredential.domain || domain}"
						windowId="{newCredential.windowId || 'manual'}"
						on:close="{closeAddCredential}" />
				{:else if passwordGenerator}
					<PasswordGenerator
						on:close="{() => {
							passwordGenerator = false;
						}}" />
				{:else if listedCredentials.length !== 0}
					{#each listedCredentials as credential}
						<ListedCredentials
							{credential}
							selectedCredentialId="{storedCredentialId}"
							on:credentialClicked="{selectCredential}" />{/each}
				{:else}
					<PasswordNotFound />
				{/if}
			</div>
		</div>
	</div>

	{#if !addNewCredential}
		<button
			class="p-2 border border-osvauld-defaultBorder rounded-md right-4 bottom-4 fixed active:scale-[.98]"
			on:click="{handleOptionsClick}"><Add color="{'#A3A4B5'}" /></button>
		{#if showAddOptions}
			<div
				class="absolute z-50 bg-osvauld-frameblack border border-osvauld-iconblack w-[160px] rounded-lg"
				style="bottom: 35px; right: 40px;">
				<div class="flex flex-col items-start p-2 gap-1 w-full h-full">
					<button
						class="flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-md cursor-pointer"
						on:click="{triggerPasswordGenerator}">
						<span class="font-inter font-normal text-sm whitespace-nowrap"
							>Generate Password</span>
					</button>
					<button
						class="flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-md cursor-pointer"
						on:click="{addCredentialManual}">
						<span class="font-inter font-normal text-sm whitespace-nowrap"
							>Add Credential</span>
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
