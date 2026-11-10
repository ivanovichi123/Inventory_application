import { Router } from "express";
import {
  formCreateGet,
  formAuthorCreatePost,
  formBookCreatePost,
  formCategoryCreatePost,
  formUpdateGet,
  formUpdatePost,
} from "../controllers/formController.js";

const formRouter = Router();

formRouter.get("/create/:type", formCreateGet);
formRouter.post("/create/author", formAuthorCreatePost);
formRouter.post("/create/book", formBookCreatePost);
formRouter.post("/create/category", formCategoryCreatePost);
formRouter.get("/update/:type", formUpdateGet);
formRouter.post("/update/:type", formUpdatePost);

export default formRouter;
