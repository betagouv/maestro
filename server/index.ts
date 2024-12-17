import { createServer } from './server';
import { initKnex } from './repositories/db';
import { initKysely } from './repositories/kysely';
import config from './utils/config';

initKnex()
initKysely(config.databaseUrl)
createServer().start();