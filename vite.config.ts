import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3,
        ecma: 2020,
      },
      format: {
        comments: false,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide')) return 'vendor-icons';
            if (id.includes('@google/genai')) return 'vendor-ai';
            if (id.includes('zod')) return 'vendor-validation';
            return 'vendor-utils';
          }
          if (id.includes('components/ui/')) return 'module-ui-core';
          if (id.includes('components/dashboard/')) {
            const parts = id.split('/');
            const name = parts[parts.length - 1].split('.')[0].toLowerCase();
            return `module-dash-${name}`;
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'recharts',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      '@google/genai',
      'zod'
    ],
  },
});