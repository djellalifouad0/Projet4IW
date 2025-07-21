const { createLogger, format, transports } = require('winston');
const path = require('path');

let Sentry, SentryLogger, SentryFmt;
try {
  Sentry = require('@sentry/node');
  const SentryExpress = require('@sentry/express'); // si besoin ailleurs
  // init Sentry ici uniquement si pas déjà fait ailleurs
  if (!Sentry.getCurrentHub().getClient()) {
    Sentry.init({
      dsn: 'https://8ce71b849b0d16de52bb28f94a241f3e@o4509668567482368.ingest.de.sentry.io/4509668569841744',
      tracesSampleRate: 1.0,
      attachStacktrace: true,
      sendDefaultPii: true,
      _experiments: { enableLogs: true },
    });
  }

  const { logger, fmt } = Sentry;
  SentryLogger = logger;
  SentryFmt = fmt;
} catch {
  Sentry = null;
}

const winstonLogger = createLogger({
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
    new transports.Console(),
  ],
});

// 🔷 Ajoute méthodes Sentry Structured Logs

winstonLogger.sentryInfo = (msg, attributes = {}) => {
  winstonLogger.info(msg);
  if (SentryLogger) {
    SentryLogger.info(SentryFmt ? SentryFmt`${msg}` : msg, attributes);
  }
};

winstonLogger.sentryWarn = (msg, attributes = {}) => {
  winstonLogger.warn(msg);
  if (SentryLogger) {
    SentryLogger.warn(SentryFmt ? SentryFmt`${msg}` : msg, attributes);
  }
};

winstonLogger.sentryError = (err, attributes = {}) => {
  winstonLogger.error(err);
  if (SentryLogger) {
    if (err instanceof Error) {
      SentryLogger.error(SentryFmt ? SentryFmt`${err.message}` : err.message, attributes);
    } else {
      SentryLogger.error(SentryFmt ? SentryFmt`${String(err)}` : String(err), attributes);
    }
  }
};

winstonLogger.sentryDebug = (msg, attributes = {}) => {
  winstonLogger.debug(msg);
  if (SentryLogger) {
    SentryLogger.debug(SentryFmt ? SentryFmt`${msg}` : msg, attributes);
  }
};

winstonLogger.sentryFatal = (msg, attributes = {}) => {
  winstonLogger.error(msg);
  if (SentryLogger) {
    SentryLogger.fatal(SentryFmt ? SentryFmt`${msg}` : msg, attributes);
  }
};

module.exports = winstonLogger;
