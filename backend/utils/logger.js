const { createLogger, format, transports } = require('winston');
const path = require('path');
let Sentry;

try {
  // On essaie de charger Sentry s'il est initialisé
  Sentry = require('@sentry/node');
} catch {
  Sentry = null;
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  ),
  transports: [
    new transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '../logs/combined.log') }),
    new transports.Console()
  ]
});

// ⬛ Ajoute une méthode pour loguer les erreurs à Sentry en plus
logger.captureError = (err) => {
  logger.error(err);
  if (Sentry) {
    if (err instanceof Error) {
      Sentry.captureException(err);
    } else {
      Sentry.captureMessage(typeof err === 'string' ? err : JSON.stringify(err), 'error');
    }
  }
};

logger.captureInfo = (msg) => {
  logger.info(msg);
  if (Sentry) {
    Sentry.captureMessage(msg, 'info');
  }
};

module.exports = logger;
