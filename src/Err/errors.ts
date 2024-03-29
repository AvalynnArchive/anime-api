import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

export const ERROR_WRONG_STATUS_CODE = 'The url returned a wrong status code. Maybe the website is down at the moment.';
export const ERROR_SEARCH_EMPTY = 'The mandatory search parameter is empty.';

export function handle_error(message: string, details?: any): void {
  const error = {};
  logger.info(message);
  if (details) {
    logger.info(details);
  }
}
