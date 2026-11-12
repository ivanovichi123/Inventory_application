import {
  getAllBooks,
  getAllAuthors,
  getAllCategories,
  getTheFilter,
  getTheFilterBooks,
  getTheFilterAuthors,
} from "../db/queries.js";

async function userIndexGet(req, res) {
  console.log("Index get");
  let theCategories = await getAllCategories();
  res.render("index", {
    categories: theCategories,
  });
}

async function userBookGet(req, res) {
  console.log("Get all books");
  let theBooks = await getAllBooks();
  let theCategories = await getAllCategories();
  console.log(theBooks);
  res.render("viewBookItems", {
    categories: theCategories,
    books: theBooks,
    type: "normal",
  });
}

async function userAuthorGet(req, res) {
  console.log("Get all authors");
  let theAuthors = await getAllAuthors();
  let theCategories = await getAllCategories();
  res.render("viewAuthorItem", {
    categories: theCategories,
    authors: theAuthors,
    type: "normal",
  });
}

async function userFilterGet(req, res) {
  let theCategories = await getAllCategories();
  console.log("Filter get");
  let { filter } = req.params;
  console.log("the filter: ", filter);
  let theFilterGet = await getTheFilter(filter);
  console.log("the filter get: ", theFilterGet);

  if (theFilterGet[0].category_filter[0][1] === "books") {
    console.log("I enter the books");
    let theRealFilter = await getTheFilterBooks(
      theFilterGet[0].category_filter,
    );

    console.log("the real filter: ", theRealFilter);
    console.log("the categories: ", theCategories);

    res.render("viewBookItems", {
      categories: theCategories,
      books: theRealFilter,
      type: "filter",
    });
  } else if (theFilterGet[0].category_filter[0][1] === "authors") {
    console.log("I enter the authors");
    let theRealFilter = await getTheFilterAuthors(
      theFilterGet[0].category_filter,
    );

    console.log("the real filter: ", theRealFilter);

    res.render("viewAuthorItem", {
      categories: theCategories,
      authors: theRealFilter,
      type: "filter",
    });
  }
}

export { userIndexGet, userBookGet, userAuthorGet, userFilterGet };
