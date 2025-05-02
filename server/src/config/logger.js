const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const LEVEL = Symbol.for('level');
const fs = require('fs');

// Define log format
const logFormat = combine(
  timestamp(),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

function filterOnly(level) {
  return format(function (info) {
    if (info[LEVEL] === level) {
      return info;
    }
  })();
}

const logger = createLogger({
  level: 'debug',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console({ format: format.combine(format.colorize(), format.simple()) }),
    new transports.File({
      level: 'debug',
      format: filterOnly('debug'),
      filename: 'logs/application.log',
    }),
    new transports.File({
      level: 'error',
      format: filterOnly('error'),
      filename: 'logs/error.log',
    }),
    new transports.File({
      level: 'warn',
      format: filterOnly('warn'),
      filename: 'logs/performance.log',
    }),
    new transports.File({
      level: 'info',
      format: filterOnly('info'),
      filename: 'logs/system.log',
    }),
  ],
});
if (process.env.NODE_ENV !== 'production') {
  logger.transports.forEach((transport) => {
    if (transport instanceof transports.Console) {
      transport.silent = false;
    } else {
      transport.silent = true;
    }
  });
}

// Create a write stream for Morgan access logs
const accessLogStream = fs.createWriteStream('logs/access.log', { flags: 'a' });

module.exports = { logger, accessLogStream };
