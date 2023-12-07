const config = {
    compilerOptions: {
        onwarn(warning, handler) {
            const { code } = warning;
            if (code === "a11y-non-interactive-element-interactions") return;

            handler(warning);
        },
    },
};

export default config;