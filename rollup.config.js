
import { exec } from "child_process";
import svelte from "rollup-plugin-svelte";
import commonjs from '@rollup/plugin-commonjs';
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import preprocess from 'svelte-preprocess';
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

const production = !process.env.ROLLUP_WATCH;
function serve() {
  return {
    writeBundle() {
      // Open Brave browser with the specified URL
      exec("brave-browser http://reload.extensions", (err) => {
        if (err) {
          console.error("Failed to open Brave:", err);
        }
      });
    },
  };
}
export default [
  {
    input: "src/main.ts",
    output: {
      file: "public/build/bundle.js",
      format: "iife",
      name: "app",
    },
    plugins: [
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
      postcss({
        extract: true,
        minimize: true,
        sourceMap: !production,
        config: {
          path: "./postcss.config.cjs",
        },
      }),
      resolve({ browser: true }),
      commonjs(),
      !production && serve(),
    ],
  },
  {
    input: "src/scripts/background.ts",
    output: {
      format: "iife",
      name: "background",
      file: "public/background.js",
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.background.json",
      }),
      commonjs(),
      resolve({ browser: true, preferBuiltins: false }),
    ],
    watch: {
      clearScreen: false,
    },
  },
];
