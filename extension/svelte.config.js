import preprocess from "svelte-preprocess";

const config = {
  preprocess: preprocess({
    typescript: {
      tsconfigFile: './tsconfig.app.json',
      reportDiagnostics: true
    },
    }),
};

export default config;
