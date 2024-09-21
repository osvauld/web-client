import browserPolyfill from "webextension-polyfill";

const isTauri = true;

export const browser = {
	storage: {
		local: {
			get: async (key: string) => {
				// Use Tauri's storage API or alternatives
				console.log("Tauri: Getting", key);
				return {};
			},
			set: async (data: object) => {
				// Use Tauri's storage API or alternatives
				console.log("Tauri: Setting", data);
			},
		},
	},
	tabs: {
		query: async (queryInfo: any) => {
			console.log("test", queryInfo);
		},
	},
	runtime: {
		sendMessage: async (message: any) => {
			// Implement Tauri IPC here
			console.log("Tauri: Sending message", message);
		},
		onMessage: async (callback: any) => {
			console.log("Tauri: Listening to messages", callback);
		},
	},
	// Add other browser APIs as needed
};

export const isBrowserExtension = !isTauri;
