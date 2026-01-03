import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  server: {
    port: 5000,
  },

  plugins: [
    react(),

    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React packages - MUST load first with highest priority
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return '0-react-core';
          }

          // React ecosystem - depends on React
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }

          if (
            id.includes('node_modules/@reduxjs') ||
            id.includes('node_modules/react-redux') ||
            id.includes('node_modules/redux')
          ) {
            return 'redux';
          }

          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform') ||
            id.includes('node_modules/zod')
          ) {
            return 'forms';
          }

          // Heavy UI libraries
          if (id.includes('node_modules/apexcharts') || id.includes('node_modules/react-apexcharts')) {
            return 'charts';
          }

          if (id.includes('node_modules/@fullcalendar')) {
            return 'calendar';
          }

          if (id.includes('node_modules/@react-pdf')) {
            return 'pdf';
          }

          if (id.includes('node_modules/@react-jvectormap')) {
            return 'maps';
          }

          // Utility libraries
          if (
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/flatpickr')
          ) {
            return 'date-utils';
          }

          if (
            id.includes('node_modules/react-toastify') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge')
          ) {
            return 'ui-utils';
          }

          // lucide-react and other third-party libraries - load AFTER React
          if (id.includes('node_modules/')) {
            return 'z-vendor';
          }
        },
      },
    },
  },
});
