import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/*export default defineConfig({
  plugins: [react()],
})*/

export default defineConfig({
  base: "/",
  plugins: [react()],
  preview: {
    port: 9000,
    strictPort: true,
    host: true,
    allowedHosts: ['fultang.ddns.net'],
  },
  server: {
    port: 9000,
    strictPort: true,
    host: true,
  }
})