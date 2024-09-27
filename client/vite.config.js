import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://api.nettleship.net', // should make this an env variable
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
})