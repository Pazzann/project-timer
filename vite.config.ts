import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from 'tailwindcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  }
})
