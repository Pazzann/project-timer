import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from 'tailwindcss'
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  base: './',
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  }
})
