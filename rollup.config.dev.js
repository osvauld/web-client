import { exec } from "child_process";
import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import preprocess from "svelte-preprocess";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import os from "os";


function serve() {
    return {
      writeBundle() {
        let command;
        if (os.platform() === "linux") {
          command = "brave --reload-extension=public/build";
        } else {
          command =
          "'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' --reload-extension=public/build";
          
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
        postcss({
            extract: `${outputFileName}.css`,
            minimize: false,
            plugins: [tailwindcss(), autoprefixer()],
          }),
      svelte({
        compilerOptions: {
          dev: true,
        },
        preprocess: preprocess({
          typescript: {
            tsconfigFile: "./tsconfig.app.json",
          },
        }),
      }),
      typescript({  tsconfig: "./tsconfig.app.json" }),
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
      }),
      commonjs(),
      resolve({ browser: true, preferBuiltins: false }),
      serve()
    ],
    watch: {
      clearScreen: false,
    },
  },
];