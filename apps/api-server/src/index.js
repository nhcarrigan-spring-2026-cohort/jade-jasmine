import "dotenv/config";
import { app } from "./serverSetup.js";
import logger from "./utils/logger.js";

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info(`listening on port ${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${port} is already in use.`);
  } else {
    logger.error("Server startup error:", err);
  }
  process.exit(1); // Exit the process if a critical error occurs
});
