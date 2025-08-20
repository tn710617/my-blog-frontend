/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    
    // Handle JSX in .js files (for CRA compatibility)
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    
    // Environment variable handling - support both VITE_ and REACT_APP_ prefixes during transition
    envPrefix: ['VITE_', 'REACT_APP_'],
    
    // Dev server configuration - optimized for Docker compatibility
    server: {
      port: 3000,
      host: '0.0.0.0', // Allow connections from Docker host
      strictPort: true,
      hmr: {
        port: 3000, // Use same port for HMR in Docker
        host: 'localhost'
      }
    },
    
    // Build configuration - maintain CRA-like output structure
    build: {
      outDir: 'build',
      sourcemap: (mode || 'development') !== 'production',
      
      // Rollup options to match CRA output structure
      rollupOptions: {
        output: {
          // Create similar file structure to CRA for deployment compatibility
          entryFileNames: 'static/js/[name].[hash].js',
          chunkFileNames: 'static/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const extType = info[info.length - 1]
            if (/\.(css)$/.test(assetInfo.name)) {
              return 'static/css/[name].[hash].[ext]'
            }
            if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name)) {
              return 'static/media/[name].[hash].[ext]'
            }
            return 'static/[ext]/[name].[hash].[ext]'
          }
        }
      }
    },
    
    // Path resolution - handle absolute imports if needed
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'src': resolve(__dirname, 'src')
      }
    },

    // CSS configuration - PostCSS auto-detected from postcss.config.js

    // Preview server configuration (for production builds)
    preview: {
      port: 3000,
      host: '0.0.0.0'
    },

    // Additional dependency optimization
    // optimizeDeps also configured above for JSX handling
    
    // Vitest configuration - following official setup guide
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
    }
}))