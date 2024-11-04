// @ts-nocheck
import { Store } from '@tauri-apps/plugin-store';
import { invoke } from "@tauri-apps/api/core";
const tauriBrowser = {
	storage: {
		local: {
			get: async (key) => {
				const store = await Store.load('my_app_store8.bin');
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
				const store = await Store.load('my_app_store8.bin');
				// console.log("Tauri: Setting", data);
				try {
					const key = Object.keys(data)[0];
					const value = data[key];

					// Ensure both key and value are strings
					if (typeof key !== "string" || typeof value !== "string") {
						throw new Error("Both key and value must be strings");
					}

					console.log(key, value);
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
			try {
				// Map actions to their specific handlers
				const handlerMap = {
					'isSignedUp': () => invoke('check_signup_status'),
					'savePassphrase': (data) => invoke('handle_save_passphrase', { input: data }),
					'checkPvtLoaded': () => invoke('check_private_key_loaded'),
					'getPubKey': (data) => invoke('handle_get_public_key', { input: data }),
					'signChallenge': (data) => invoke('handle_sign_challenge', { input: data }),
					'addCredential': (data) => invoke('handle_add_credential', { input: data }),
					'hashAndSign': (data) => invoke('handle_hash_and_sign', { input: data }),
					'importPvtKey': (data) => invoke('handle_import_certificate', { input: data }),
					'exportCertificate': (data) => invoke('handle_export_certificate', { input: data }),
					'changePassphrase': (data) => invoke('handle_change_passphrase', { input: data }),
					'addFolder': (data) => invoke('handle_add_folder', { input: data }),
					'getFolder': () => invoke('handle_get_folders'),
					'getCredentialsForFolder': (data) => invoke('handle_get_credentials_for_folder', { input: data }),
				};

				const handler = handlerMap[action];
				if (!handler) {
					throw new Error(`Unknown action: ${action}`);
				}

				return await handler(data);
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
