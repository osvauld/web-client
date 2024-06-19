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
import fs from "fs";
const production = !process.env.ROLLUP_WATCH;
const buildEnv = process.env.BUILD_ENV;
function serve() {
  return {
    writeBundle() {
      // Open Brave browser with the specified URL
      if(production) {
      const manifestSource = buildEnv === 'firefox' ? 'public/manifests/manifest_firefox.json' : 'public/manifests/manifest_chrome.json';
      const manifestDest = 'public/manifest.json';
      fs.copyFileSync(manifestSource, manifestDest);
      }else {
        let command;
        if (os.platform() === "linux") {
          command = "brave-browser  --reload-extension=public/build";
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
      }
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
      sourcemap: !production,
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
      format: buildEnv === 'firefox' ? 'iife' : 'es',
      name: "background",
      file: "public/background.js",
      sourcemap: !production,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.background.json",
        sourceMap: !production,
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
      sourcemap: !production,
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.background.json",
      }),
      commonjs(),
      resolve({ browser: true, preferBuiltins: false }),
      serve(),
    ],
    watch: {
      clearScreen: false,
    },
  },
];
