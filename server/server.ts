import express, { Application } from 'express';
// Allows to throw an error or reject a promise in controllers
// instead of having to call the next(err) function.
import * as Sentry from '@sentry/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import RouteNotFoundError from './errors/routeNotFoundError';
import errorHandler from './middlewares/error-handler';
import { m2mProtectedRouter } from './routers/m2mProtected';
import { protectedRouter } from './routers/protected';
import unprotectedRouter from './routers/unprotected';
import config from './utils/config';

const PORT = config.serverPort;

interface Server {
  app: Application;

  start(): void;
}

export function createServer(): Server {
  const app = express();

  app.use(cookieParser());
  app.use((req, res, next) => {
    if (!req.originalUrl.startsWith('/storybook')) {
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'self'", 'https://stats.beta.gouv.fr'],
            frameSrc: [],
            styleSrc: [
              "'self'",
              'https://unpkg.com/maplibre-gl@4.1.2/dist/maplibre-gl.css',
              // https://github.com/mui/material-ui/issues/19938
              "'unsafe-inline'"
            ],
            imgSrc: [
              "'self'",
              'https://stats.beta.gouv.fr',
              'https://jedonnemonavis.numerique.gouv.fr',
              `https://${config.s3.client.endpoint.split('//')[1]}`,
              'data:'
            ],
            fontSrc: ["'self'", 'data:'],
            objectSrc: ["'self'"],
            mediaSrc: ["'self'"],
            connectSrc: [
              "'self'",
              'https://stats.beta.gouv.fr',
              'https://openmaptiles.data.gouv.fr',
              'https://openmaptiles.geo.data.gouv.fr',
              'https://openmaptiles.github.io',
              'https://api.maptiler.com',
              `https://${config.s3.client.endpoint.split('//')[1]}`
            ],
            workerSrc: ["'self'", 'blob:'],
            manifestSrc: ["'self'"]
          }
        }
      })(req, res, next);
    } else {
      next();
    }
  });

  if (config.environment === 'development') {
    app.use(cors({ origin: config.application.host, credentials: true }));
  } else if (config.environment === 'production') {
    app.use(
      cors({
        origin: ['https://maestro.beta.gouv.fr', config.application.host],
        methods: 'GET,HEAD',
        allowedHeaders: ['Content-Type'],
        credentials: true
      })
    );
  }

  app.use(fileUpload());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const rateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    limit: config.maxRate, // start blocking after X requests for windowMs time
    message: 'Too many request from this address, try again later please.'
  });
  app.use(rateLimiter);
  app.set('trust proxy', 1);

  app.use('/api/m2m', m2mProtectedRouter);
  app.use('/api', unprotectedRouter);
  app.use('/api', protectedRouter);

  app.use(
    '/dsfr/dist',
    express.static(
      path.join(import.meta.dirname, '../node_modules/@gouvfr/dsfr/dist')
    )
  );

  if (config.environment === 'production') {
    app.use(
      '/storybook',
      express.static(
        path.join(import.meta.dirname, '../frontend/storybook-static')
      )
    );
    app.get('/storybook', (_req, res) => {
      res.sendFile(
        path.join(
          import.meta.dirname,
          '../frontend/storybook-static',
          'index.html'
        )
      );
    });
    app.use(express.static(path.join(import.meta.dirname, '../frontend/dist')));
    app.get(
      '/*splat',
      function (_req: any, res: { sendFile: (arg0: any) => void }) {
        res.sendFile(
          path.join(import.meta.dirname, '../frontend/dist', 'index.html')
        );
      }
    );
  }

  app.all('/*splat', () => {
    throw new RouteNotFoundError();
  });

  // The error handler must be before any other error middleware and after all controllers.
  if (config.sentry.enabled && config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app);
  }
  app.use(errorHandler());

  const start = () =>
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });

  return {
    app,
    start
  };
}
