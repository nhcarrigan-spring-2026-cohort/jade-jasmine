import passport from "passport";
import AuthError from "../errors/AuthError.js";
import logger from "../utils/logger.js";

import crypto from "node:crypto";

import "dotenv/config";

import { getUserById } from "../db/queries.js";

import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const jwtopts = {};
jwtopts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
if (!process.env.JWT_SECRET) {
  logger.info("found no jwt secret in .env, so must create one");
  const b = crypto.randomBytes(33); // any number over 32 is fine

  logger.error(`Setup the JWT_SECRET value in .env with: ${b.toString("hex")}`);
  throw new AuthError("Failed to find a jwt secret in .env", 500);
}
jwtopts.secretOrKey = process.env.JWT_SECRET;

passport.use(
  new JwtStrategy(jwtopts, async function (jwt_payload, done) {
    logger.info(
      "passport authentication will use this payload value: ",
      jwt_payload.sub,
    );
    if (jwt_payload.sub) {
      try {
        const user = await getUserById(jwt_payload.sub);

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account ?
        }
      } catch (err) {
        return done(err);
      }
    } else {
      return done(null, false);
    }
  }),
);

export default passport;