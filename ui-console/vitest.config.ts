import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/tests/**', // Exclude Playwright tests
      '**/playwright-report/**',
      '**/test-results/**',
    ],
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ]
  },
})