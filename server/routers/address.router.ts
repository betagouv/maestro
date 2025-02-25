import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../utils/config';

const router = express.Router();

router.use(
  '/search',
  createProxyMiddleware({
    target: `${config.apis.address.url}/search`,
    changeOrigin: true,
    pathRewrite: { '/?': '' },
    on: {
      proxyRes: (proxyRes) => {
        proxyRes.headers['access-control-allow-origin'] =  config.application.host;
      }
    },
  })
);

export default router;
