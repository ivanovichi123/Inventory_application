import { getAllBooks } from "../db/queries.js";

const userIndexGet = (req, res) => {
  console.log("Index get");
  res.render("index");
};

async function userBookGet(req, res) {
  console.log("Get all books");
  let theBooks = await getAllBooks();
  res.render("viewItems", {
    books: theBooks,
  });
};

export { userIndexGet, userBookGet };
