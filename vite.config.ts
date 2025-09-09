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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Core React chunks
            if (id.includes('react') && !id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor'
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor'
            }
            
            // UI library chunks
            if (id.includes('@radix-ui') && (id.includes('dialog') || id.includes('dropdown') || id.includes('select') || id.includes('tabs') || id.includes('popover'))) {
              return 'ui-vendor'
            }
            if (id.includes('@radix-ui') && (id.includes('checkbox') || id.includes('radio') || id.includes('switch') || id.includes('slider'))) {
              return 'radix-forms'
            }
            if (id.includes('recharts')) {
              return 'chart-vendor'
            }
            if (id.includes('@fullcalendar')) {
              return 'calendar-vendor'
            }
            if (id.includes('date-fns')) {
              return 'date-utils'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'icon-vendor'
            }
            
            // Default vendor chunk for other node_modules
            return 'vendor'
          }
          
          // App chunks based on route structure
          if (id.includes('src/pages/admin/')) {
            return 'admin-pages'
          }
          if (id.includes('src/pages/manager/')) {
            return 'manager-pages'
          }
          if (id.includes('src/pages/auth/') || id.includes('src/pages/Auth') || id.includes('src/pages/AuthCallback')) {
            return 'auth-pages'
          }
          if (id.includes('src/layouts/')) {
            return 'layouts'
          }
          if (id.includes('src/components/sections/')) {
            return 'sections'
          }
          if (id.includes('src/components/')) {
            return 'components'
          }
        }
      }
    }
  },
  define: {
    'process.env': process.env,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
  },
})