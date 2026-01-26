
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser', // Use Terser for superior minification
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096, // Inline small assets to reduce requests
    chunkSizeWarningLimit: 1000,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple optimization passes
      },
      format: {
        comments: false, // Strip comments
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunking
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide')) return 'vendor-icons';
            if (id.includes('@google/genai')) return 'vendor-ai';
            if (id.includes('zod')) return 'vendor-logic';
            return 'vendor-libs';
          }
          // Component chunking for optimal lazy loading
          // Splits each dashboard view into its own file
          if (id.includes('components/dashboard/')) {
            const match = id.match(/components\/dashboard\/(.*?)\.tsx/);
            if (match) {
              const componentName = match[1].toLowerCase();
              return `dash-${componentName}`;
            }
          }
          // Core UI chunk
          if (id.includes('components/ui/')) return 'module-ui-core';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'lucide-react', '@google/genai'],
  },
});
