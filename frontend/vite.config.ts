import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: false,
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'src/index.html'),
                pet: path.resolve(__dirname, 'src/pet.html')
            },
            output: {
                dir: 'dist',
                entryFileNames: 'src/[name].js',
                chunkFileNames: 'src/[name].[hash].js',
                assetFileNames: 'src/[name].[ext]'
            }
        },
        assetsDir: 'src'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    publicDir: 'src/assets',
}); 