import { Router } from "express";
import { userIndexGet, userFilterGet } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/", userIndexGet);
userRouter.get("/:filter", userFilterGet);

export default userRouter;
