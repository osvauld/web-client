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



const production = !process.env.ROLLUP_WATCH;
function serve() {
  return {
    writeBundle() {
      let command;
      if (os.platform() === "linux") {
        command = "brave-browser http://reload.extensions";
      } else {
        command =
          '/usr/bin/open -a "/Applications/Brave Browser.app" "http://reload.extensions"';
      }

      // Open Brave browser with the specified URL
      exec(command, (err) => {
        if (err) {
          console.error("Failed to open Brave:", err);
        }
      });
    },
  };
}

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
        extract: `${outputFileName}.css`,
        minimize: true,
        sourceMap: !production,
        config: {
          path: "./postcss.config.cjs",
        },
      }),
      typescript({ sourceMap: !production, tsconfig: "./tsconfig.app.json" }),
      resolve({ browser: true }),
      commonjs(),
      !production && serve(),
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
