import express from "express";
import path, { dirname } from "express-validator";
import userRouter from "./routes/userRouter.js";
import formRouter from "./routes/formRouter.js";

const app = express();

app.set("views", path.join(import.meta.dirname), "views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use("/form", formRouter);
app.use("/", userRouter);

const PORT = 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Listening on port ${PORT}!`);
});
