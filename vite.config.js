import { resolve } from 'path';
import { defineConfig } from 'vite';

const cleanUrlMap = {
  '/': '/index.html',
  '/about-us': '/about-us.html',
  '/services': '/services.html',
  '/our-safety-promise': '/our-safety-promise.html',
  '/team': '/team.html',
  '/contact': '/contact.html',
  '/admin': '/admin.html',
  '/admin-login': '/admin-login.html',
};

function attachCleanUrlMiddleware(server) {
  server.middlewares.use((req, _res, next) => {
    const url = req.url ? req.url.split('?')[0] : '';
    if (url in cleanUrlMap) {
      req.url = cleanUrlMap[url];
    }
    next();
  });
}

export default defineConfig({
  appType: 'mpa',
  plugins: [
    {
      name: 'clean-url-middleware',
      configureServer(server) {
        attachCleanUrlMiddleware(server);
      },
      configurePreviewServer(server) {
        attachCleanUrlMiddleware(server);
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        about: resolve(__dirname, 'about-us.html'),
        safety: resolve(__dirname, 'our-safety-promise.html'),
        team: resolve(__dirname, 'team.html'),
        contact: resolve(__dirname, 'contact.html'),
        admin: resolve(__dirname, 'admin.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
      },
    },
  },
});
