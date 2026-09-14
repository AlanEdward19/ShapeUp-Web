import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const inlineCssStub = {
  name: 'inline-css-stub',
  resolveId(id) {
    if (id.includes('?inline')) return id
  },
  load(id) {
    if (id.includes('?inline')) return 'export default ""'
  },
}

export default defineConfig({
  plugins: [react(), inlineCssStub],
  test: {
    environment: 'jsdom',
    pool: 'forks',
    setupFiles: ['./src/test/setup.js'],
  },
})
