import { Router } from "express";
import { userIndexGet, userBookGet } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/books", userBookGet);
userRouter.get("/", userIndexGet);


export default userRouter;
