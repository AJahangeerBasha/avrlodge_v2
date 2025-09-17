import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3010',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    target: 'es2022',
    rollupOptions: {
      external: [],
      output: {
        format: 'es',
        manualChunks: {
          // Group problematic dependencies together
          'vendor-core': ['@supabase/supabase-js'],
          'react-vendor': ['react', 'react-dom', 'framer-motion'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react'],
        }
      }
    }
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query'
    ],
    exclude: ['@supabase/supabase-js'],
    force: true
  },
})