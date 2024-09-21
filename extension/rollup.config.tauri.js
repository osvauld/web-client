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

const production = !process.env.ROLLUP_WATCH;

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
			"process.env.IS_TAURI": JSON.stringify(true),
			preventAssignment: true,
		}),
		svelte({
			compilerOptions: {
				dev: !production,
			},
			preprocess: preprocess({
				typescript: {
					tsconfigFile: "./tsconfig.tauri.json",
				},
				postcss: {
					plugins: [tailwindcss, autoprefixer],
				},
			}),
		}),
		postcss({
			extract: "index.css",
			minimize: production,
			sourceMap: !production,
			config: {
				path: "./postcss.config.cjs",
			},
		}),
		typescript({
			sourceMap: !production,
			tsconfig: "./tsconfig.tauri.json",
		}),
		resolve({
			browser: true,
			preferBuiltins: false,
			dedupe: ["svelte"],
		}),
		commonjs(),
		!production &&
			serve({
				contentBase: "dist",
				port: 5173,
			}),
		!production && livereload("dist"),
	],
	watch: {
		clearScreen: false,
	},
};
