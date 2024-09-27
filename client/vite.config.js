import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(() => {
  // eslint-disable-next-line no-undef  
  const env = loadEnv('', process.cwd(), '')

  return {
    // vite config
    //define: {
    //  __APP_ENV__: JSON.stringify(env.APP_ENV),
    //}, not sure what this does but ill keep it here for now
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.API_DOMAIN, // should make this an env variable
          changeOrigin: true,
          secure: env.NODE_ENV === 'production',
        },
      },
    },
    plugins: [react()],
  }
})
