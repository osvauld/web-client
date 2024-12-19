<script lang="ts">
	import {
		credentialListWithType,
		currentVault,
	} from "../store/desktop.ui.store";
	import {
		CATEGORIES,
		renderRelevantHeading,
	} from "../../utils/credentialUtils";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import Menu from "../../../icons/Menu.svelte";

	let credentials = [];

	const fetchCredentials = async (vaultId: string) => {
		try {
			credentials = await sendMessage("getCredentialsForFolder", {
				folderId: vaultId,
			});
		} catch (error) {
			credentials = [];
		}
	};

	$: {
		fetchCredentials($currentVault.id);
	}

	$: updatedCredentials = $credentialListWithType
		? credentials.filter(
				(credential) =>
					credential.data.credentialType === $credentialListWithType,
			)
		: credentials;
</script>

<div class="grow px-16 py-4">
	<div class="h-full flex flex-wrap content-start gap-3">
		{#each updatedCredentials as credential}
			{@const credentialType = credential.data.credentialType}
			{@const categoryInfo = CATEGORIES.find(
				(item) => item.type === credentialType,
			)}
			<div
				class="bg-osvauld-frameblack h-[4rem] basis-[24rem] shrink-0 grow-0 rounded-xl p-3">
				<span class="flex justify-center items-center p-2">
					<svelte:component this="{categoryInfo.icon}" color="{'#BFC0CC'}" />
				</span>
				<div class="flex flex-col">
					<h3
						class="text-base text-left text-mobile-textbright truncate max-w-[16rem]">
						{renderRelevantHeading(
							credential.data.credentialFields,
							credentialType,
							credential.id,
						)}
					</h3>
					<span class="text-xs text-left text-mobile-textPrimary"
						>{credentialType}
					</span>
				</div>
				<button
					class="ml-auto p-3 flex justify-center items-center"
					on:click|stopPropagation="{() =>
						console.log('Propagation is not allowed here')}">
					<Menu />
				</button>
			</div>
		{/each}
	</div>
</div>
