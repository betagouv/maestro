import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../utils/config';

const router = express.Router();

export const rewriteCompanySearchPath = (path: string) =>
  `/search${path.replace(/^\//, '')}`;

router.use(
  '/search',
  createProxyMiddleware({
    target: config.apis.company.url,
    changeOrigin: true,
    pathRewrite: rewriteCompanySearchPath,
    on: {
      proxyRes: (proxyRes) => {
        proxyRes.headers['access-control-allow-origin'] =
          config.application.host;
      }
    }
  })
);

export default router;
