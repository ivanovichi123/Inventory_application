import { Router } from "express";
import {
  formCreateGet,
  formCreatePost,
  formUpdateGet,
  formUpdatePost,
} from "../controllers/formController.js";

const formRouter = Router();

formRouter.get("/create/:type", formCreateGet);
formRouter.post("/create/:type", formCreatePost);
formRouter.get("/update/:type", formUpdateGet);
formRouter.post("/update/:type", formUpdatePost);

export default formRouter;
