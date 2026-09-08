import { Router } from "express";
import {
  formCreateGet,
  formCreatePost,
  formUpdateGet,
  formUpdatePost,
} from "../controllers/formController.js";

const formRouter = Router();

formRouter.get("/form/create", formCreateGet);
formRouter.post("/form/create", formCreatePost);
formRouter.get("/form/update", formUpdateGet);
formRouter.post("/form/update", formUpdatePost);

export default formRouter;
