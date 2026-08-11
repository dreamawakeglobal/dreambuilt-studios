import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        consultation: './consultation.html',
        project: './project.html',
        pricing: './pricing.html'
      }
    }
  }
});
