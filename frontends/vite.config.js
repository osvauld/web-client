import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { fileURLToPath } from "url";
import preprocess from "svelte-preprocess";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createConfig = ({ mode, platform }) => {
	const isTauri = platform === "tauri";
	const isExtension = platform === "extension";
	const isDev = mode === "development";
	const isMobile = process.env.TAURI_ENV_PLATFORM === "mobile";
	const hmrPort = isMobile ? 1420 : 1421;
	const serverPort = isMobile ? 1420 : 1421;

	// Log configuration for debugging
	console.log('Server Configuration:', {
		isMobile,
		serverPort,
		platform,
		mode,
		tauri: isTauri
	});

	// Determine root directory based on platform and environment
	let root = "src/extension";
	if (isTauri) {
		root = isMobile ? "src/mobile" : "src/desktop";
	}

	return {
		appType: "spa",
		clearScreen: false,
		root: path.resolve(__dirname, root),

		plugins: [
			svelte({
				preprocess: preprocess({
					typescript: true,
					postcss: {
						plugins: [tailwindcss(), autoprefixer()],
					},
				}),
				compilerOptions: {
					dev: isDev,
				},
				hot: isDev && {
					preserveState: true,
				},
			}),
		],

		resolve: {
			alias: {
				"*": path.resolve(__dirname, "src/*"),
				...(isTauri
					? {
						"webextension-polyfill": path.resolve(
							__dirname,
							"src/utils/browserMock.ts",
						),
					}
					: {}),
			},
		},

		css: {
			postcss: {
				plugins: [tailwindcss(), autoprefixer()],
			},
		},

		build: {
			target: isTauri
				? process.env.TAURI_ENV_PLATFORM === "windows"
					? "chrome105"
					: "safari13"
				: "es2015",
			minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
			sourcemap: !!process.env.TAURI_ENV_DEBUG,
			outDir: isTauri ? (isMobile ? "mobile" : "desktop") : "public/build",
			emptyOutDir: true,
		},
		server: {
			strictPort: true,
			port: serverPort,
			// Using a simpler configuration that ensures IPv4 binding
			host: '0.0.0.0',
			// Remove the object configuration as it's not working as intended
			hmr: {
				protocol: 'ws',
				host: '0.0.0.0',
				port: serverPort,
				clientPort: serverPort,
				// Add specific transport configuration for WebSocket
				transport: {
					kind: 'tcp',
					options: {
						host: '0.0.0.0'
					}
				}
			},
			// Make sure preview also uses IPv4
			preview: {
				port: serverPort,
				host: '0.0.0.0'
			},
			// Keep the existing watch and CORS configurations
			watch: {
				usePolling: true,
				interval: 1000,
			},
			cors: true,
			headers: {
				'Access-Control-Allow-Origin': '*',
			}
		}

	};
};

export default defineConfig(({ command, mode }) => {
	console.log("Build Mode:", mode);
	console.log("IS_TAURI:", process.env.IS_TAURI);

	if (process.env.IS_TAURI === "true") {
		return createConfig({ mode, platform: "tauri" });
	}

	if (process.env.BUILD_ENV === "extension") {
		return createConfig({ mode, platform: "extension" });
	}

	return createConfig({ mode, platform: "extension" });
});