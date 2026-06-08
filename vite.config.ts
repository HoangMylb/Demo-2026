import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('node_modules/antd') || id.includes('node_modules/rc-') || id.includes('node_modules/@ant-design') || id.includes('node_modules/@babel/runtime')) {
            return 'antd-vendor';
          }

          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-vendor')) {
            return 'charts-vendor';
          }

          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'router-vendor';
          }

          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
            return 'forms-vendor';
          }

          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion-dom')) {
            return 'motion-vendor';
          }

          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }

          if (id.includes('node_modules/zustand')) {
            return 'state-vendor';
          }

          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }

          return undefined;
        },
      },
    },
  },
});
