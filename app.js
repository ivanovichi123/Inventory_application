//Sentry start
import "./instrument.js";
import * as Sentry from "@sentry/node"
//Sentry finish
import express from "express";
import path from "node:path";
import userRouter from "./routes/userRouter.js";
import formRouter from "./routes/formRouter.js";

const app = express();

app.set("views", path.join(import.meta.dirname), "views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use("/form", formRouter);
app.use("/", userRouter);

//Sentry start
Sentry.setupExpressErrorHandler(app);
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
})
//Sentry finish

const PORT = 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}!`);
});
