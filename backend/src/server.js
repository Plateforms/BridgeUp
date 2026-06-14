import app from './app.js';
import { getEnv } from './config/env.js';
import logger from './config/logger.js';

const env = getEnv();

app.listen(env.PORT, () => {
  logger.info(`Internship API running on port ${env.PORT} [${env.NODE_ENV}]`);
});
