import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        about: resolve(__dirname, 'about-us.html'),
        safety: resolve(__dirname, 'our-safety-promise.html'),
        team: resolve(__dirname, 'team.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
