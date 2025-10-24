import winston from 'winston';
import { env } from './env.js';

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.message, stack: info.stack });
  }
  return info;
});

export const logger = winston.createLogger({
  level: env.logLevel,
  levels: winston.config.npm.levels,
  format: winston.format.combine(
    enumerateErrorFormat(),
    env.nodeEnv === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const base = `${timestamp} [${level}]: ${message}`;
      const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      const stackTrace = stack ? `\n${stack}` : '';
      return `${base}${metaString}${stackTrace}`;
    })
  ),
  transports: [new winston.transports.Console()]
});
