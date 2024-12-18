import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { fileURLToPath } from "url";
import preprocess from "svelte-preprocess";
import { server } from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORTS = {
	MOBILE: 1420,
	DESKTOP: 1421,
	EXTENSION: 1424
};
const createConfig = ({ mode, platform }) => {
	const isTauri = platform === "tauri";
	const isExtension = platform === "extension";
	const isDev = mode === "development";
	const isMobile = process.env.TAURI_ENV_PLATFORM === "mobile";

	// Determine root directory based on platform and environment
	let root = "src/extension";
	let serverPort = PORTS.EXTENSION;
	if (isTauri) {
		root = isMobile ? "src/mobile" : "src/desktop";
		serverPort = isMobile ? PORTS.MOBILE : PORTS.DESKTOP;
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
					injectCss: false,
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
			host: process.env.TAURI_DEV_HOST || "0.0.0.0",
			hmr: {
				protocol: 'ws',
				host: process.env.TAURI_DEV_HOST || '0.0.0.0',
				port: serverPort,
				clientPort: serverPort,
				timeout: 30000,
				overlay: false,
				reconnect: 2000
			},
			watch: {
				usePolling: true,
				interval: 1000,
			},
			shutdown: {
				delay: 0
			}
		},
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