import winston from "winston";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
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
  level: "silly",
  format: logFormat,
  transports: [
    new winston.transports.Console(), // for testing
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // high priority errors
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

export default logger;