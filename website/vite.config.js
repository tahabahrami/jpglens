import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: './index.html',
        docs: './docs/index.html',
        examples: './examples/index.html',
        comparison: './comparison/index.html'
      },
      output: {
        manualChunks: {
          vendor: ['highlight.js', 'prismjs'],
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['highlight.js', 'prismjs']
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  preview: {
    port: 8080,
    host: true
  }
})
