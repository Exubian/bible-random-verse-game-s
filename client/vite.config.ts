import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte({
    /* compilerOptions: {
      dev: true,
    } */
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})