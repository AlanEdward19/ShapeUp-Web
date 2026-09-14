import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  return {
  root: rootDir,
  appType: 'mpa',
  mode: 'capture',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /[/\\]src[/\\]contexts[/\\]AuthContext\.jsx$/, replacement: path.resolve(rootDir, 'src/capture/mocks/authContext.jsx') },
      { find: /[/\\]src[/\\]contexts[/\\]UserProfileContext\.jsx$/, replacement: path.resolve(rootDir, 'src/capture/mocks/userProfileContext.jsx') },
      { find: /[/\\]src[/\\]firebase\.js$/, replacement: path.resolve(rootDir, 'src/capture/mocks/firebase.js') },
    ],
  },
  server: {
    port: 5185,
    strictPort: true,
  },
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
  },
};
});
