import { Pool } from "pg";
import { env } from "node:process";
import logger from "../utils/logger.js";

const connectionString = `postgresql://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

logger.info("connection string: ", connectionString);

// Add logging to see what's happening
logger.info("Environment check in db/init.ts:", {
  NODE_ENV: env.NODE_ENV,
  DATABASE_URL: env.DATABASE_URL ? "EXISTS" : "MISSING",
  DATABASE_URL_length: env.DATABASE_URL?.length,
});

const dbConfig = env.NODE_ENV === "production"
    ? {
      // Note for deployment on Railway, these environment variables need to be shared from the database service into the nodejs app block
      // this is a manual process that must be done in the Railway dashboard (via their gui)
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
}
: {
  database: env.PGDATABASE,
  host: env.PGHOST,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  port: env.PGPORT,
};

export const pool = new Pool(dbConfig);
