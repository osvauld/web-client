import { Store } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
const store = new Store(".my_app_store5.bin");
const tauriBrowser = {
	storage: {
		local: {
			get: async (key) => {
				// console.log("Tauri: Getting", key);
				try {
					const value = await store.get(key);
					if (
						typeof value === "string" ||
						value === null ||
						value === undefined
					) {
						return { [key]: value };
					} else {
						// If value is not a string, convert it to a string
						return { [key]: JSON.stringify(value) };
					}
				} catch (error) {
					console.error(`Error getting ${key} from storage:`, error);
					return { [key]: null };
				}
			},
			set: async (data) => {
				// console.log("Tauri: Setting", data);
				try {
					const key = Object.keys(data)[0];
					const value = data[key];

					// Ensure both key and value are strings
					if (typeof key !== "string" || typeof value !== "string") {
						throw new Error("Both key and value must be strings");
					}

					await store.set(key, value);
					await store.save(); // Save changes to disk
				} catch (error) {
					console.error(`Error setting data in storage:`, error);
				}
			},
		},
	},
	tabs: {
		query: async (queryInfo: any) => {
			console.log("Tauri: Query tabs", queryInfo);
			// Implement Tauri-specific tabs query or return mock data
			return [];
		},
	},
	runtime: {
		sendMessage: async ({ action, data }) => {
			// console.log("Tauri: Sending message", action);
			try {
				const response = await invoke("handle_crypto_action", {
					action,
					data,
				});
				console.log(response, action);
				return response;
			} catch (error) {
				console.error("Error invoking Tauri command:", error);
				throw error;
			}
		},
		onMessage: {
			addListener: (
				callback: (message: any, sender: any, sendResponse: any) => void,
			) => {
				console.log("Tauri: Adding message listener");
				// Implement Tauri-specific message listening
			},
		},
	},
};
export default tauriBrowser;
