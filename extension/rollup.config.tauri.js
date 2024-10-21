import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import preprocess from "svelte-preprocess";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import replace from "@rollup/plugin-replace";
import alias from "@rollup/plugin-alias";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const production = !process.env.ROLLUP_WATCH;
const isTauri = process.env.IS_TAURI === "true";

export default {
	input: "src/dashboard.ts",
	output: {
		file: "dist/index.js",
		format: "iife",
		name: "app",
		sourcemap: !production,
	},
	plugins: [
		replace({
			"process.env.IS_TAURI": JSON.stringify(isTauri),
			preventAssignment: true,
		}),
		isTauri &&
		alias({
			entries: [
				{
					find: "webextension-polyfill",
					replacement: path.resolve(__dirname, "src/utils/browserMock.ts"),
				},
			],
		}),
		svelte({
			compilerOptions: {
				dev: !production,
			},
			preprocess: preprocess({
				typescript: {
					tsconfigFile: "./tsconfig.app.json",
				},
				postcss: {
					plugins: [tailwindcss, autoprefixer],
				},
			}),
		}),
		typescript({ sourceMap: !production, tsconfig: "./tsconfig.app.json" }),
		resolve({
			browser: true,
			dedupe: ["svelte"],
		}),
		commonjs(),
		postcss({
			plugins: [tailwindcss(), autoprefixer()],
			extract: "index.css",
		}),
		!production && serve({ contentBase: "dist", port: 5173 }),
		!production && livereload("dist"),
	],
};
