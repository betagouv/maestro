import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = express.Router();

router.use(
  '/search',
  createProxyMiddleware({
    target: 'https://recherche-entreprises.api.gouv.fr/search',
    changeOrigin: true,
    pathRewrite: { '/?': '' },
  })
);

export default router;
