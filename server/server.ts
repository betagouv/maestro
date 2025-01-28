import express, { Application } from 'express';
// Allows to throw an error or reject a promise in controllers
// instead of having to call the next(err) function.
import cors from 'cors';
import 'express-async-errors';
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
import sentry from './utils/sentry';

const PORT = config.serverPort;

export interface Server {
  app: Application;
  start(): Promise<void>;
}

export function createServer(): Server {
  const app = express();

  sentry.init(app);

  app.use(
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
          imgSrc: ["'self'", 'https://stats.beta.gouv.fr', 'data:'],
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
    })
  );

  if (config.environment === 'development') {
    app.use(cors({ origin: 'http://localhost:3000' }));
  }

  app.use(fileUpload());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const rateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: config.maxRate, // start blocking after X requests for windowMs time
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
      express.static(path.join(import.meta.dirname, '../frontend/build'))
    );
    app.get('*', function (_req: any, res: { sendFile: (arg0: any) => void }) {
      res.sendFile(
        path.join(import.meta.dirname, '../frontend/build', 'index.html')
      );
    });
  }

  app.all('*', () => {
    throw new RouteNotFoundError();
  });
  sentry.errorHandler(app);
  app.use(errorHandler());

  function start(): Promise<void> {
    return new Promise((resolve) => {
      app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
        resolve();
      });
    });
  }

  return {
    app,
    start
  };
}
