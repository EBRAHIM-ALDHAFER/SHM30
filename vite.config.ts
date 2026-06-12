import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
    },
    base: './',
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor: Supabase
            if (id.includes('@supabase')) return 'vendor-supabase';
            // Vendor: Firebase
            if (id.includes('firebase')) return 'vendor-firebase';
            // Vendor: Google AI
            if (id.includes('@google/genai')) return 'vendor-genai';
            // Vendor: html2canvas + jspdf (heavy)
            if (id.includes('html2canvas') || id.includes('jspdf')) return 'vendor-pdf';
            // Vendor: motion/framer
            if (id.includes('motion')) return 'vendor-motion';
            // Vendor: React core
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
            // Core services
            if (id.includes('src/core/database')) return 'core-services';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
