import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
            if (normalizedId.includes('/node_modules/')) {
              if (/[\\/]node_modules[\\/](framer-motion|motion|motion-dom|motion-utils)[\\/]/.test(normalizedId)) {
                return 'vendor-motion';
              }
              if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(normalizedId)) {
                return 'vendor-icons';
              }
              if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(normalizedId)) {
                return 'vendor-react';
              }
              if (/[\\/]node_modules[\\/]@supabase[\\/]/.test(normalizedId)) {
                return 'vendor-supabase';
              }
              return 'vendor-deps';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
