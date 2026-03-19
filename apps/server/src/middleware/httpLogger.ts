import morgan from 'morgan';

const format =
  process.env.HTTP_LOG_FORMAT ??
  (process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

export const httpLogger = morgan(format);
