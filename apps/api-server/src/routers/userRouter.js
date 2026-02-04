// Routes belonging to /user 

const { Router } = require("express");

const passport = require("passport");


const {
  login,
  getUser,
  signUp,
  /* TODO
  updateUser,
  deleteUser,
  */
} = require("../controllers/userController");

/* TODO
const { handleExpressValidationErrors } = require("./routerUtil");
*/

const userRouter = Router();

/* TODO
const {
  validateUserFields,
  validateOptionalUserFields,
} = require("../validators/userValidator");
 */

const AuthError = require("../errors/AuthError");

userRouter.get(
  "/authenticate",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const user = req.user;
    console.log("after authentication ran: ", user);
    if (user) {
      res
        .status(200)
        .json({
          status: "success",
          message: "Authorization confirmed.",
          userid: user.id,
        });
    } else {
      throw new AuthError();
    }
  },
);

/* TODO
userRouter
  .route("/sign-up")
  .post(validateUserFields, handleExpressValidationErrors, signUp);
*/

userRouter.route("/login").post(login);

// note that we retrieve the user id from the jwt token so we don't need it specified in the route
userRouter
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), getUser)
  /* TODO
  .put(
    passport.authenticate("jwt", { session: false }),
    validateOptionalUserFields,
    handleExpressValidationErrors,
    updateUser,
  )
  .delete(passport.authenticate("jwt", { session: false }), deleteUser);
  */

module.exports = userRouter;