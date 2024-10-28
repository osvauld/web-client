import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { fileURLToPath } from 'url';
import preprocess from 'svelte-preprocess';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createConfig = ({ mode, platform }) => {
    const isTauri = platform === 'tauri';
    const isExtension = platform === 'extension';
    const isDev = mode === 'development';
    const isMobile = process.env.TAURI_ENV_PLATFORM === 'mobile';

    // Determine root directory based on platform and environment
    const host = process.env.TAURI_DEV_HOST;
    const ports = {
        mobile: {
            server: 1420,
            hmr: 1421
        },
        desktop: {
            server: 1422,
            hmr: 1423
        }
    };
    const currentPorts = isMobile ? ports.mobile : ports.desktop;
    let root = 'src/extension';
    if (isTauri) {
        root = isMobile ? 'src/mobile' : 'src/desktop';
    }

    return {
        appType: 'spa',
        clearScreen: false,
        root: path.resolve(__dirname, root),

        plugins: [
            svelte({
                preprocess: preprocess({
                    typescript: true,
                    postcss: {
                        plugins: [
                            tailwindcss(),
                            autoprefixer()
                        ]
                    }
                }),
                compilerOptions: {
                    dev: isDev
                }
            })
        ],

        resolve: {
            alias: {
                '*': path.resolve(__dirname, 'src/*'),
                ...(isTauri ? {
                    'webextension-polyfill': path.resolve(__dirname, 'src/utils/browserMock.ts'),
                } : {}),
            }
        },

        css: {
            postcss: {
                plugins: [
                    tailwindcss(),
                    autoprefixer()
                ]
            }
        },

        build: {
            target: isTauri
                ? (process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13')
                : 'es2015',
            minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
            sourcemap: !!process.env.TAURI_ENV_DEBUG,
            outDir: isTauri ? (isMobile ? 'mobile' : 'desktop') : 'public/build',
            emptyOutDir: true
        },


        server: {
            strictPort: true,
            port: currentPorts.server,
            host: '0.0.0.0', // Always bind to all interfaces for mobile
            hmr: {
                protocol: 'ws',
                host: host || '0.0.0.0',
                port: currentPorts.hmr,
                clientPort: currentPorts.hmr // Add this line
            },
            watch: {
                usePolling: true
            }
        }
    };
};

export default defineConfig(({ command, mode }) => {
    console.log('Build Mode:', mode);
    console.log('IS_TAURI:', process.env.IS_TAURI);
    console.log('TAURI_DEV_HOST:', process.env.TAURI_DEV_HOST);  // New addition
    if (process.env.IS_TAURI === 'true') {
        return createConfig({ mode, platform: 'tauri' });
    }

    if (process.env.BUILD_ENV === 'extension') {
        return createConfig({ mode, platform: 'extension' });
    }

    return createConfig({ mode, platform: 'extension' });
});