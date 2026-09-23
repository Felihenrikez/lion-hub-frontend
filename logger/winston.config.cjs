const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      if (!Object.keys(meta).length) {
        return `${timestamp} ${level}: ${message}`;
      }

      const metaJson = JSON.stringify(meta, null, 2)
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');

      return `${timestamp} ${level}: ${message} -\n${metaJson}`;
    })
  ),
  transports: [new transports.Console()]
});

module.exports = { logger };
