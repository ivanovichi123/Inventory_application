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

export { getAllBooks };

