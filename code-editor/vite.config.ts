import {defineConfig} from 'vite';
// @ts-ignore
import path from 'path';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                frontend: path.resolve(__dirname, 'public/index.html'),
                preload: path.resolve(__dirname, 'electron/preload.ts')
            },
            output: {
                entryFileNames: (chunk) => {
                    if (chunk.name === 'preload') return 'preload.js';
                    return 'assets/[name].js';
                }
            }
        },
        outDir: 'dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 4000
    }
});
