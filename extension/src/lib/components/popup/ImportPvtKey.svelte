<script lang="ts">
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();
	import { sendMessage } from "../dashboard/helper";
	import { StorageService } from "../../../scripts/storageHelper";
	import { createChallenge, initiateAuth } from "../dashboard/apis";
	import NewPassword from "../basic/NewPassword.svelte";

	let recoveryData = "";

	const handleInputChange = (event: any) => {
		recoveryData = event.target.value;
	};

	const handleSubmit = async (e: any) => {
		const passphrase = e.detail.passphrase;
		const { certificate, baseUrl } = JSON.parse(recoveryData);

		await StorageService.setBaseUrl(baseUrl);
		await sendMessage("importPvtKey", {
			passphrase,
			certificate,
		});
		const pubkey = await sendMessage("getPubKey", { passphrase });
		const challengeResponse = await createChallenge(pubkey);
		const signature = await sendMessage("signChallenge", {
			challenge: challengeResponse.data.challenge,
		});
		const verificationResponse = await initiateAuth(signature, pubkey);
		const token = verificationResponse.data.token;
		if (token) {
			await StorageService.setToken(token);
			await StorageService.setIsLoggedIn("true");
			dispatch("login", true);
		}
	};
</script>

<div
	class="flex flex-col justify-center items-center text-osvauld-sheffieldgrey">
	<div>
		<h3 class="font-medium text-3xl mb-6 text-osvauld-ownerText">
			Account Recovery
		</h3>
	</div>
	<label for="privateKey" class="font-normal mt-6 mb-2"
		>Enter Recovery string</label>
	<textarea
		class="text-osvauld-quarzowhite bg-osvauld-frameblack border border-osvauld-iconblack tracking-wider font-light text-sm font-mono focus:border-osvauld-iconblack focus:ring-0 resize-none w-[300px] min-h-[6rem] max-h-[10rem] rounded-lg scrollbar-thin overflow-y-scroll"
		id="privateKey"
		on:input="{handleInputChange}"></textarea>
	<NewPassword on:submit="{handleSubmit}" />
</div>
