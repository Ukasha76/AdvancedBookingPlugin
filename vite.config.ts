import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-to-dist',
      closeBundle() {
        const src = path.resolve(__dirname, 'wordpress-plugin/celltech-booking/dist')
        const dest = path.resolve(__dirname, 'dist')
        cpSync(src, dest, { recursive: true })
      },
    },
  ],
  base: './',
  build: {
    // write directly into plugin directory so we can ship as a WP plugin
    outDir: 'wordpress-plugin/celltech-booking/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: './index.html',
    },
  },
});
