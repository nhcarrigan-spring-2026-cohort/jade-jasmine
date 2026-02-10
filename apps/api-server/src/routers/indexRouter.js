/**
 * this file no longer being used but I'm keeping it around in case we need it later
 */
import express from "express";

//import process from "process";
// Define __dirname equivalent for ESM compatibility
//const __dirname = process.cwd();


const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.status(200).sendFile("index.html");
});


export default indexRouter;