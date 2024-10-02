import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'


export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_DOMAIN, // should make this an env variable
          changeOrigin: true,
          secure: env.NODE_ENV === 'production',
        },
      },
    },
    plugins: [react()],
  }
})
