import { exec } from "child_process";
import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import preprocess from "svelte-preprocess";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import os from "os";

function buildConfig(inputFileName, outputFileName) {
  return {
    input: `src/${inputFileName}.ts`,
    output: {
      file: `public/build/${outputFileName}.js`,
      format: "iife",
      name: "app",
    },
    plugins: [
      svelte({
        compilerOptions: {
          dev: false,
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
        extract: `${outputFileName}.css`,
        minimize: true,
        sourceMap: false,
        config: {
          path: "./postcss.config.cjs",
        },
      }),
      typescript({ sourceMap: true, tsconfig: "./tsconfig.app.json" }),
      resolve({ browser: true }),
      commonjs(),
    ],
    watch: {
      clearScreen: false,
    },
  };
}
export default [
  buildConfig("popup", "popup"),
  buildConfig("dashboard", "dashboard"),
  {
    input: "src/scripts/background.ts",
    output: {
      format: "es",
      name: "background",
      file: "public/background.js",
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.background.json",
        sourceMap: true,
      }),
      commonjs(),
      resolve({ browser: true, preferBuiltins: false }),
    ],
    watch: {
      clearScreen: false,
    },
  },
  {
    input: "src/scripts/content.ts",
    output: {
      format: "iife",
      name: "content",
      file: "public/content.js",
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
