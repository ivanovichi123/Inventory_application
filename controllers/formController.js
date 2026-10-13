import { getAllCategories, addOneAuthor } from "../db/queries.js";
import { body, matchedData, validationResult } from "express-validator";

const validateAuthor = [
  body("nameInput")
    .trim()
    .isAlpha('es-ES', {ignore: ' '})
    .withMessage('Name must only contain letters')
    .isLength({ min: 1, max: 60 })
    .withMessage('Name must be between 1 and 60 characters'),
  body("ageInput")
    .trim()
    .isNumeric()
    .withMessage('Age must be a number')
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be between 1 and 120'),
  body("statusAuthor")
    .trim(),
  body("bioInput")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Bio must be between 1 and 200 characters'),
];

async function formCreateGet (req, res) {
  console.log("get form author");
  let theCategories = await getAllCategories();
  let { type } = req.params;
  if(type === 'author') {
    res.render("formAuthor", {
      categories: theCategories,
    });
  }
};

const formCreatePost = [
  validateAuthor,
  async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      let theCategories = await getAllCategories();
      return res.status(400).render("formAuthor", {
        errors: errors.array(), 
        categories: theCategories,
      });
    }
    const { nameInput, ageInput, statusAuthor, bioInput } = matchedData(req);
    await addOneAuthor(nameInput, ageInput, statusAuthor, bioInput);
    res.redirect("/authors");
  }
];

const formUpdateGet = (req, res) => {
  res.render("formUpdate");
};

const formUpdatePost = (req, res) => {
  res.redirect("/filter");
};

export { formCreateGet, formCreatePost, formUpdateGet, formUpdatePost };
