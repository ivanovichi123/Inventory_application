import { Router } from "express";
import {
  formCreateGet,
  formCreatePost,
  formUpdateGet,
  formUpdatePost,
} from "../controllers/formController.js";

const formRouter = Router();

formRouter.get("/form/create/:type", formCreateGet);
formRouter.post("/form/create/:type", formCreatePost);
formRouter.get("/form/update/:type", formUpdateGet);
formRouter.post("/form/update/:type", formUpdatePost);

export default formRouter;
