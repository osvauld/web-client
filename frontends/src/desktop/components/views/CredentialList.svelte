<script lang="ts">
	import {
		selectedCategory,
		currentVault,
		credentialEditorModal,
		viewCredentialModal,
		currentCredential,
	} from "../store/desktop.ui.store";
	import {
		CATEGORIES,
		renderRelevantHeading,
	} from "../../utils/credentialUtils";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	import Menu from "../../../icons/Menu.svelte";

	let credentials = [];
	let prevEditorModalState = false;

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

	$: {
		if (prevEditorModalState && !$credentialEditorModal) {
			fetchCredentials($currentVault.id);
		}
		prevEditorModalState = $credentialEditorModal;
	}

	$: updatedCredentials = $selectedCategory
		? credentials.filter(
				(credential) => credential.data.credentialType === $selectedCategory,
			)
		: credentials;

	const selectedCredential = (credential) => {
		viewCredentialModal.set(true);
		currentCredential.set(credential);
	};
</script>

<div class="grow px-16 py-4">
	<div class="h-full flex flex-wrap content-start gap-3">
		{#each updatedCredentials as credential (credential.id)}
			{@const credentialType = credential.data.credentialType}
			{@const categoryInfo = CATEGORIES.find(
				(item) => item.type === credentialType,
			)}
			<button
				class="bg-osvauld-frameblack flex h-[4rem] basis-[24rem] items-center shrink-0 grow-0 rounded-xl p-3"
				on:click="{() => selectedCredential(credential)}">
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
			</button>
		{/each}
	</div>
</div>
