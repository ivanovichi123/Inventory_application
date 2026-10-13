import { Router } from "express";
import {
  userIndexGet,
  userBookGet,
  userAuthorGet,
  userFilterGet,
} from "../controllers/userController.js";

const userRouter = Router();


userRouter.get("/books", userBookGet);
userRouter.get("/authors", userAuthorGet);
userRouter.get("/:filter", userFilterGet);
userRouter.get("/", userIndexGet);

export default userRouter;
