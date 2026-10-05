import { getAllBooks, getAllAuthors } from "../db/queries.js";

const userIndexGet = (req, res) => {
  console.log("Index get");
  res.render("index");
};

async function userBookGet(req, res) {
  console.log("Get all books");
  let theBooks = await getAllBooks();
  res.render("viewBookItems", {
    books: theBooks,
  });
};

async function userAuthorGet(req, res) {
  console.log("Get all authors");
  let theAuthors = await getAllAuthors();
  console.log("aaa: ", theAuthors);
  res.render("viewAuthorItem", {
    authors: theAuthors,
  });
};

export { userIndexGet, userBookGet,userAuthorGet };
