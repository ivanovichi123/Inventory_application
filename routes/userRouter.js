import { Router } from "express";
import { userIndexGet, userBookGet, userAuthorGet } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/books", userBookGet);
userRouter.get("/authors", userAuthorGet);
userRouter.get("/", userIndexGet);


export default userRouter;
