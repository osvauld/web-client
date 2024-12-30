<script lang="ts">
	import QRCode from "@castlenine/svelte-qrcode";
	import { onMount } from "svelte";
	import { sendMessage } from "../../../lib/components/dashboard/helper";
	let connectionTicket = "";
	let certificate = "";
	let recoveryString = "";
	onMount(async () => {
		connectionTicket = await sendMessage("getTicket");
		// TODO: change the passphrase to the actual password
		certificate = await sendMessage("exportCertificate", {
			passphrase: "test",
		});
		recoveryString = JSON.stringify({
			ticket: connectionTicket,
			certificate: certificate,
		});
		console.log(recoveryString);
	});
</script>

{#if recoveryString}
	<div class="mx-auto">
		<QRCode
			size="{512}"
			typeNumber="{40}"
			data="{JSON.stringify({
				ticket: connectionTicket,
				certificate: certificate,
			})}" />
	</div>
{/if}
<div
	class="text-3xl text-white font-bold grow flex justify-center items-center">
	Notess
</div>
