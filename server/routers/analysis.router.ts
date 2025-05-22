import analysisController from '../controllers/analysisController';
import { SubRouter } from './routes.type';

export const analysisRouterMethods = {
  '/analysis': {
    get: analysisController.getAnalysis,
    post: analysisController.createAnalysis
  },
  '/analysis/:analysisId': {
    put: analysisController.updateAnalysis
  }
} as const satisfies SubRouter;
