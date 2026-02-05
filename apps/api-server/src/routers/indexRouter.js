import express from "express";

export default const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.status(200).json({
    message:
      "The jade-jasmine API", //TODO return the api.yml doc?
  });
});
