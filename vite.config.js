import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.js')
      },
      output: {
        entryFileNames: 'shuang-assets.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'iife',           // 打包成單一自執行檔，不留裸模組名稱
        inlineDynamicImports: true
      }
    },
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2015'
  }
});
