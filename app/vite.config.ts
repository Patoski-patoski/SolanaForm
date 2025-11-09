// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define: {
//     global: 'window',
//   },
//   optimizeDeps: {
//     esbuildOptions: {
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           process: true,
//         }),
//       ],
//     },
//   },
//   resolve: {
//     alias: {
//       crypto: 'crypto-browserify',
//       stream: 'stream-browserify',
//     },
//   },
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
})