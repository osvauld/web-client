<script>
	import { invoke } from "@tauri-apps/api/core";
	import { onMount } from "svelte";
	let connectionInfo = "";
	onMount(async () => {
		try {
			console.log("Share this connection string:", connectionString);
			console.log(process.env.IS_TAURI);
			await invoke("connect_to_peer", {
				connectionString:
					"/ip4/117.216.239.238/udp/55788/webrtc-direct/certhash/uEiCqDvzahjPnTysVG2S22Kc5tmCpD9fEz2_vCUu8wzPswQ/p2p/12D3KooWCX6aQxxZ7fRhARujoNEyNE6x1rUzguHE2AjAoDbTz7Dh",
			});
			console.log("Connected successfully");
		} catch (error) {
			console.error("Connection failed:", error);
		}
	});
</script>

<h1>
	Mobile
	<br />
	<small>Connection Info: {connectionInfo}</small>
</h1>
