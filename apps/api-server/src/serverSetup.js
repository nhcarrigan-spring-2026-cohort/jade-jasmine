import { default as express } from "express";
import crypto from "node:crypto";
import cors from "cors";
import AppError from "./errors/AppError.js";
import ValidationError from "./errors/ValidationError.js";
import "dotenv/config";
import { env } from "node:process";
import logger from "./utils/logger.js";
import passport from "./middleware/passport.js";
import indexRouter from "./routers/indexRouter.js";
import userRouter from "./routers/userRouter.js";


if (!env.JWT_SECRET) {
  logger.error("found no jwt secret in .env, so must create one");
  const b = crypto.randomBytes(40); // any number over 32 is fine
  logger.error(`Setup the JWT_SECRET value in .env with: ${b.toString("hex")}`);
  process.exit(1);
}

const app = express();

if (env.NODE_ENV === "production") {
  logger.info("This is a production environment");
  app.set("trust proxy", 1); // trust first proxy only because of deployment to Render, remove otherwise
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow known clients as well as requests with no origin (like mobile apps, curl requests)
      const allowedOrigins = env.CLIENT_ORIGINS.split(',')
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new AppError('Not allowed by CORS'));
      }
    },
    credentials: false, 
    allowedHeaders: ["Content-Type", "Authorization"], 
    //methods: ["GET", "POST", "PUT", "OPTIONS"], // may not need this
  }),
);

// need to initialize passport
app.use(passport.initialize());

// just sets up the basic route that describes the api
app.use("/", indexRouter);

// the router for the user related actions like signup and login etc
app.use("/user", userRouter);

// Catch-all for unhandled routes (must be placed last but before the error handler)
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `This is a surprising request. I can't find ${req.originalUrl} on this server!`,
  });
});

const INTERNAL_ERROR =
  "Internal Server Error. Contact support if this error persists.";

// catch-all for errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const timestamp = new Date().toUTCString();
  res.set({ "Content-Type": "application/problem+json" }); // this type from https://datatracker.ietf.org/doc/html/rfc7807#section-3
  try {
    logger.error("================================================");
    logger.error("in the catch-all: ", { timestamp, err,stack: err.stack });

    if (err instanceof AppError || err.name === "AppError") {
      {
        res.status(err.statusCode);
        if (err instanceof ValidationError) {
          res.json({
            statusCode: err.statusCode,
            timestamp: err.timestamp,
            message: err.message,
            data: err.data,
          });
        } else {
          res.json({
            statusCode: err.statusCode,
            timestamp: err.timestamp,
            message: err.message,
          });
        }
      }
      if (res.statusCode < 400) {
        res.status(500);
        res.json({
          statusCode: 500,
          timestamp,
          message: INTERNAL_ERROR,
        });
      } else if (!(err instanceof AppError)) {
        res.status(500).json({ timestamp, message: INTERNAL_ERROR });
      }
    } else {
      res.status(500).json({ timestamp, message: INTERNAL_ERROR });
    }
  } catch (error) {
    logger.error(error)
    res.status(500).json({ timestamp, message: INTERNAL_ERROR });
  }
});

export { app };