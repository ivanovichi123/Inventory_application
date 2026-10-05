import pool from "./pool.js";

async function getAllBooks() {
    const { rows } = await pool.query("SELECT books.name AS bookName, books.synopsis, authors.name As authorName, ARRAY_AGG(genre.name) AS genreName, bookImage FROM books"
    + " LEFT JOIN book_author ON books.id = book_author.book_id"
    + " LEFT JOIN authors ON author_id = authors.id"
    + " LEFT JOIN genre_book ON books.id = genre_book.book_id"
    + " LEFT JOIN genre ON genre_id = genre.id"
    + " GROUP BY"
    + " bookName,"
    + " synopsis,"
    + " authorName,"
    + " bookImage;");
    return rows;
}

async function getAllAuthors() {
    const { rows } = await pool.query("SELECT authors.name AS authorName, authors.age AS authorAge, authors.status AS authorStatus, authors.authorimage as authorImage, authors.bio AS authorBio ,ARRAY_AGG(books.name) AS authorbooks FROM authors"
    + " LEFT JOIN book_author ON authors.id = book_author.author_id"
    + " LEFT JOIN books ON book_author.book_id = books.id"
    + " GROUP BY"
    + " authorName,"
    + " authorAge,"
    + " authorStatus,"
    + " authorImage,"
    + " authorBio;");
    return rows;
}

export { getAllBooks, getAllAuthors };

