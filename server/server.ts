import express, { Application } from 'express';
// Allows to throw an error or reject a promise in controllers
// instead of having to call the next(err) function.
import cors from 'cors';
import 'express-async-errors';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import path from 'path';
import RouteNotFoundError from './errors/routeNotFoundError';
import protectedRouter from './routers/protected';
import unprotectedRouter from './routers/unprotected';
import config from './utils/config';

const PORT = config.serverPort;

export interface Server {
  app: Application;
  start(): Promise<void>;
}

export function createServer(): Server {
  const app = express();

  // sentry.init(app);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://stats.beta.gouv.fr',
          ],
          frameSrc: [],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://unpkg.com/maplibre-gl@4.1.2/dist/maplibre-gl.css',
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
            `https://${config.s3.bucket}.${
              config.s3.client.endpoint.split('//')[1]
            }`,
          ],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    })
  );

  if (config.environment === 'development') {
    app.use(cors({ origin: 'http://localhost:3000' }));
  }

  app.use(fileUpload());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // const rateLimiter = rateLimit({
  //   windowMs: 5 * 60 * 1000, // 5 minutes window
  //   max: config.maxRate, // start blocking after X requests for windowMs time
  //   message: 'Too many request from this address, try again later please.',
  // });
  // app.use(rateLimiter);
  app.set('trust proxy', 1);

  app.use('/api', unprotectedRouter);
  app.use('/api', protectedRouter);

  if (config.environment === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/build')));
    app.get('*', function (req: any, res: { sendFile: (arg0: any) => void }) {
      res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
    });
  }

  app.all('*', () => {
    throw new RouteNotFoundError();
  });
  // sentry.errorHandler(app);
  // app.use(errorHandler());

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
    start,
  };
}
