import winston from "winston";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
};

const logFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json(),
  winston.format.printf(
    ({ timestamp, level, message, logMetadata, stack }) => {
      return `${timestamp} ${level}: ${logMetadata || ""} ${message} ${stack || ""}`;
    }
  )
);

const logger = winston.createLogger({
  levels: logLevels,
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // high priority errors
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;