import { default as express } from "express";
import crypto from "node:crypto";
import cors from "cors";
import "dotenv/config";
import { AppError } from "./errors/AppError.js";
import { ValidationError } from "./errors/ValidationError.js";
import { env } from "node:process";

if (!env.SESSION_SECRET) {
  console.log("found no session secret in .env, so must create one");
  const b = crypto.randomBytes(40); // any number over 32 is fine
  console.log(
    `Setup the SESSION_SECRET value in .env with: ${b.toString("hex")}`,
  );
  process.exit(1);
}

const app = express();

if (env.NODE_ENV === "production") {
  console.log("This is a production environment");

  app.set("trust proxy", 1); // trust first proxy only because of deployment to Render?
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true, // allow cookies,
    allowedHeaders: ["Content-Type", "Authorization"], // may not need to specify Authorization
    methods: ["GET", "POST", "PUT", "OPTIONS"], // may not need this
  }),
);

app.use((req, res, next) => {
  console.log(req.params);
  next();
});

//TODO add middleware for setting up session with store in postgresql

// just sets up the basic route that describes the api
import { indexRouter } from "./routers/indexRouter.js";
app.use("/", indexRouter);

// Catch-all for unhandled routes (must be placed last but before error handler)
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
    console.log("================================================");
    console.error("in the catch-all: ", timestamp, err, err.stack);

    if (err instanceof AppError || err.name === "AppError") {
      {
        res.status(err.statusCode);
        if (err instanceof ValidationError) {
          res.json({
            statusCode: err.statusCode,
            timestamp: err.timestamp,
            message: err.message,
            details: err.details,
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
    console.log(error)
    res.status(500).json({ timestamp, message: INTERNAL_ERROR });
  }
});

export { app };