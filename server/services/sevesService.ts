import type { SevesId } from 'maestro-shared/schema/Sample/Seves';
import config from '../utils/config';

export const getSevesUrl = (sevesId: SevesId) =>
  `${config.seves.url}/evenement-produit/${sevesId}`;
