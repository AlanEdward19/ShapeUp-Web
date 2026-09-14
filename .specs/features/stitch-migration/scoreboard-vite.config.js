import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      [path.join(root, 'src/contexts/UserProfileContext.jsx')]: path.join(root, 'src/test/mocks/userProfileParity.jsx'),
    },
  },
});
