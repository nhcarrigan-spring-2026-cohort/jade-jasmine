import winston, { format } from "winston";
const { combine, errors, printf, colorize, timestamp } = format;

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
};

const logFormat = printf(({ level, message, timestamp, stack, ...other }) => {
  let log = `${timestamp}\n [${level}]: ${message}`;

  if (Object.keys(other).length > 0) {
    log += `\n--\n${JSON.stringify(other, null, 2)}\n--`;
  } else {
    if (other) {
      log += "\n logged object has no keys"
    }
  }

  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

const logger = winston.createLogger({
  levels: logLevels,
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize(),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat,
        colorize(),
      ),
    }),

    new winston.transports.File({ filename: "logs/error.log", level: "warn" }), // high priority errors
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
/*
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
*/
export default logger;
