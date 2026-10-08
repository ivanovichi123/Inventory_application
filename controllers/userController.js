import { getAllBooks, getAllAuthors, getAllCategories, getTheFilter, getTheFilterBooks, getTheFilterAuthors } from "../db/queries.js";

async function userIndexGet(req, res) {
  console.log("Index get");
  let theCategories = await getAllCategories();
  res.render("index", {
    categories: theCategories,
  });
};

async function userBookGet(req, res) {
  console.log("Get all books");
  let theBooks = await getAllBooks();
  let theCategories = await getAllCategories();
  res.render("viewBookItems", {
    categories: theCategories,
    books: theBooks,
  });
};

async function userAuthorGet(req, res) {
  console.log("Get all authors");
  let theAuthors = await getAllAuthors();
  let theCategories = await getAllCategories();
  console.log(theAuthors);
  res.render("viewAuthorItem", {
    categories: theCategories,
    authors: theAuthors,
  });
};

async function userFilterGet(req, res) {
  let theCategories = await getAllCategories();
  console.log("Filter get");
  let { filter } = req.params;
  let theFilterGet = await getTheFilter(filter);
  // console.log("filter: ", filter);
  // console.log("The filter: ", theFilterGet);
  // console.log("category filter: ", theFilterGet[0].category_filter);
  // console.log("This is supossed to be books,: ", theFilterGet[0].category_filter[0][1]);
  if(theFilterGet[0].category_filter[0][1] === 'books') {
    let theRealFilter = await getTheFilterBooks(theFilterGet[0].category_filter);
    console.log("theRealFilter: ", theRealFilter);
    res.render("viewBookItems", {
      categories: theCategories,
      books: theRealFilter,
    });

  } else if(theFilterGet[0].category_filter[0][1] === 'authors') {
    let theRealFilter = await getTheFilterAuthors(theFilterGet[0].category_filter);
    res.render("viewAuthorItem", {
      categories: theCategories,
      authors: theRealFilter,
    });
  }

};

export { userIndexGet, userBookGet,userAuthorGet, userFilterGet };
