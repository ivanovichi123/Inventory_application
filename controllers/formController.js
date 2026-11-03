import {
  getAllCategories,
  addOneAuthor,
  getAllGenresName,
  getAllAuthorsName,
  getAllBooksName,
  addOneBook,
  findBookByTitle,
  findBookBySynopsis,
  findAuthorByName,
  findAuthorByBiography,
} from "../db/queries.js";
import { body, matchedData, validationResult } from "express-validator";

const validateAuthor = [
  body("nameInput")
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("Name must only contain letters")
    .isLength({ min: 1, max: 60 })
    .withMessage("Name must be between 1 and 60 characters")
    .custom(async (value) => {
      const existingName = await findAuthorByName(value);
      if (existingName.length !== 0) {
        throw new Error("Name already in use");
      }
    }),
  body("ageInput")
    .trim()
    .isNumeric()
    .withMessage("Age must be a number")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),
  body("statusAuthor").trim(),
  body("bioInput")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Bio must be between 1 and 200 characters")
    .custom(async (value) => {
      const existingBio = await findAuthorByBiography(value);
      if (existingBio.length !== 0) {
        throw new Error("Biography already in use");
      }
    }),
  body("booksCheckbox"),
];

const validateBook = [
  body("nameBookInput")
    .trim()
    .matches(/^[\p{L}\p{N}\s.,:;'"!?()\-]+$/u)
    .withMessage("Name contains invalid characters")
    .isLength({ min: 1, max: 50 })
    .withMessage("Name must be between 1 and 50 characters")
    .custom(async (value) => {
      const existingBook = await findBookByTitle(value);
      console.log("Existing book: ", existingBook);
      if (existingBook.length !== 0) {
        throw new Error("Name already in use");
      }
    }),
  body("synBookInput")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Synopsis must be between 1 and 200 characters")
    .custom(async (value) => {
      const existingSyn = await findBookBySynopsis(value);
      if (existingSyn.length !== 0) {
        throw new Error("Synopsis already in use");
      }
    }),
  body("genresCheckbox"),
  body("nameNewGenreInput")
    .optional()
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("Genre must only contain letters")
    .isLength({ min: 1, max: 60 })
    .withMessage("Genre must be between 1 and 60 characters"),
  body("authorsCheckbox"),
];

async function formCreateGet(req, res) {
  console.log("get form author/book");
  let theCategories = await getAllCategories();
  let { type } = req.params;

  if (type === "author") {
    let theBooks = await getAllBooksName();
    res.render("formAuthor", {
      categories: theCategories,
      books: theBooks,
    });
  } else if (type === "book") {
    console.log("I am in the book");
    let theGenres = await getAllGenresName();
    let theAuthors = await getAllAuthorsName();
    res.render("formBook", {
      categories: theCategories,
      genres: theGenres,
      authors: theAuthors,
    });
  }
}

const formAuthorCreatePost = [
  validateAuthor,

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      let theCategories = await getAllCategories();
      let theBooks = await getAllBooksName();
      return res.status(400).render("formAuthor", {
        errors: errors.array(),
        categories: theCategories,
        books: theBooks,
      });
    }

    const { nameInput, ageInput, statusAuthor, bioInput, booksCheckbox } =
      matchedData(req);
    await addOneAuthor(
      nameInput,
      ageInput,
      statusAuthor,
      bioInput,
      booksCheckbox,
    );
    res.redirect("/authors");
  },
];

const formBookCreatePost = [
  validateBook,

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("I enter the error");
      let theCategories = await getAllCategories();
      let theGenres = await getAllGenresName();
      let theAuthors = await getAllAuthorsName();
      return res.status(400).render("formBook", {
        errors: errors.array(),
        categories: theCategories,
        genres: theGenres,
        authors: theAuthors,
      });
    }

    const {
      nameBookInput,
      synBookInput,
      genresCheckbox,
      nameNewGenreInput,
      authorsCheckbox,
    } = matchedData(req);
    console.log(matchedData(req));
    await addOneBook(
      nameBookInput,
      synBookInput,
      genresCheckbox,
      nameNewGenreInput,
      authorsCheckbox,
    );
    res.redirect("/books");
  },
];

const formUpdateGet = (req, res) => {
  res.render("formUpdate");
};

const formUpdatePost = (req, res) => {
  res.redirect("/filter");
};

export {
  formCreateGet,
  formAuthorCreatePost,
  formBookCreatePost,
  formUpdateGet,
  formUpdatePost,
};
