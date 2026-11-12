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
  getSpecificAuthorsName,
  getSpecificAuthorsAge,
  findCategoryByName,
  findAuthorByAgeCheckbox,
  findBookByGenreCheckbox,
  findAuthorByNameCheckbox,
  addOneCategory,
} from "../db/queries.js";
import { body, matchedData, validationResult, oneOf } from "express-validator";

const validateAuthor = [
  body("nameInput")
    .trim()
    .matches(/^[\p{L}\p{N}\s.,:;'"!?()\-]+$/u)
    .withMessage("Name contains invalid characters")
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

const validateCategory = [
  body("nameCategoryInput")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isAlpha("es-ES", { ignore: " "})
    .withMessage("Category name must only contain letters")
    .isLength({min: 1, max: 15})
    .withMessage("Category name must be between 1 and 15 characters")
    .not().isIn(['books', 'authors'])
    .withMessage("The category name can not be 'authors' or 'books'")
    .custom(async (value) => {
      const existingCategoryName = await findCategoryByName(value);
      if(existingCategoryName.length !== 0) {
        throw new Error("Category name already in use");
      }
    }),
  body("filterRadio")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isIn(['books', 'authors'])
    .withMessage("Valid values are books and authors"),
  body("namesCheckbox")
    .optional({ values: undefined })
    .trim()
    .matches(/^[\p{L}\p{N}\s.,:;'"!?()\-]+$/u)
    .withMessage("Name contains invalid characters")
    .isLength({ min: 1, max: 60 })
    .withMessage("Author name/s must be between 1 and 60 characters")
    .custom(async (value) => {
    const validNameAuthor = await findAuthorByNameCheckbox(value);
      if(validNameAuthor === 0) {
        throw new Error("An author/s name does not exist")
      }
    }),
  body("agesCheckbox")
    .optional({values: undefined})
    .trim()
    .isNumeric()
    .withMessage("Age must be a number")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120")
    .custom(async (value) => {
      const validateAgeAuthor = await findAuthorByAgeCheckbox(value);
      if(validateAgeAuthor === 0) {
        throw new Error("An age/s does not exist");
      }
    }),
  body("statusCheckbox")
    .optional({ values: undefined })
    .trim()
    .isIn(['true', 'false'])
    .withMessage("Valid values are true and false"),
  body("genresCheckbox")
    .optional({values: undefined})
    .trim()
    .isAlpha("es-ES", { ignore: " " })
    .withMessage("Genre must only contain letters")
    .isLength({ min: 1, max: 60 })
    .withMessage("Genre must be between 1 and 60 characters")
    .custom(async (value) => {
      const validateGenresBook = await findBookByGenreCheckbox(value);
      if(validateGenresBook === 0) {
        throw new Error("A genre/s does not exist")
      }
    }),
    body().custom((value, { req }) => {
      const filters = [
          req.body.namesCheckbox,
          req.body.agesCheckbox,
          req.body.statusCheckbox,
      ];

      if (req.body.filterRadio === "books") {
        filters.push(req.body.genresCheckbox);
      }

      if (!filters.some(filter => filter && filter.length > 0)) {
        throw new Error("At least one valid filter must be provided");
      }

      return true;
    }),
];

async function formCreateGet(req, res) {
  console.log("get form author/book/category");
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
  } else if (type === "category") {
    console.log("I am in the category");
    let theAuthorsNames = await getSpecificAuthorsName();
    let theAuthorsAges = await getSpecificAuthorsAge();
    let theGenresName = await getAllGenresName();
    res.render("formCategory", {
      categories: theCategories,
      names: theAuthorsNames,
      ages: theAuthorsAges,
      genres: theGenresName,
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
      console.log("errors array: ", errors.array());
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

const formCategoryCreatePost = [
  validateCategory,

  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if(!errors.isEmpty()) {
      console.log("I enter the error");
      let theCategories = await getAllCategories();
      let theAuthorsNames = await getSpecificAuthorsName();
      let theAuthorsAges = await getSpecificAuthorsAge();
      let theGenresName = await getAllGenresName();
      console.log(errors.array());
      return res.status(400).render("formCategory", {
        errors: errors.array(),
        categories: theCategories,
        names: theAuthorsNames,
        ages: theAuthorsAges,
        genres: theGenresName,
      });
    }
    console.log("matched data: ", matchedData(req));
    const {
      nameCategoryInput,
      filterRadio,
      namesCheckbox,
      agesCheckbox,
      statusCheckbox,
      genresCheckbox,
    } = matchedData(req);
    await addOneCategory(nameCategoryInput, filterRadio, namesCheckbox, agesCheckbox, statusCheckbox, genresCheckbox);
    res.redirect("/");
  }
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
  formCategoryCreatePost,
  formUpdateGet,
  formUpdatePost,
};