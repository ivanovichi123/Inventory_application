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

async function getAllCategories() {
    const { rows } = await pool.query("SELECT category_name FROM categories;");
    return rows;
}

async function getTheFilter(filter) {
    const { rows } = await pool.query("SELECT * FROM categories"
    + " WHERE category_name = $1;", [filter,]);
    return rows;
}

async function getTheFilterBooks(filters) {
    const conditions = [];
    const values = [];

    for(const [filter, value] of filters) {
        if(filter === 'authors.name') {
          values.push(value);
          conditions.push(`authors.name = $${values.length}`);
        }

        if(filter === 'genre.name') {
          values.push(value);
          conditions.push(`$${values.length} IN (genre.name)`);
        }  
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
    SELECT books.name AS bookName, books.synopsis, authors.name As authorName, ARRAY_AGG(genre.name) AS genreName, bookImage FROM books 
      LEFT JOIN book_author ON books.id = book_author.book_id 
      LEFT JOIN authors ON author_id = authors.id 
      LEFT JOIN genre_book ON books.id = genre_book.book_id 
      LEFT JOIN genre ON genre_id = genre.id 
      ${where}
      GROUP BY bookName, synopsis, authorName, bookImage;
    `;

    const { rows } = await pool.query(query, values);

    return rows;

}

async function getTheFilterAuthors(filters) {
    const conditions = [];
    const values = [];

    for(const [filter, value] of filters) {
        if(filter === 'authors.name') {
          values.push(value);
          conditions.push(`authors.name LIKE $${values.length}`);
        }

        if(filter === 'authors.age') {
          values.push(value);
          conditions.push(`authors.age = $${values.length}`);
        }  

        if(filter === 'authors.status') {
          values.push(value);
          conditions.push(`authors.status = $${values.length}`);
        }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
    SELECT authors.name AS authorName, authors.age AS authorAge, authors.status AS authorStatus, authors.authorimage as authorImage, authors.bio AS authorBio ,ARRAY_AGG(books.name) AS authorbooks FROM authors
      LEFT JOIN book_author ON authors.id = book_author.author_id
      LEFT JOIN books ON book_author.book_id = books.id
      ${where}
      GROUP BY
        authorName,
        authorAge,
        authorStatus,
        authorImage,
        authorBio;
    `;

    const { rows } = await pool.query(query, values);

    return rows;
}


export { getAllBooks, getAllAuthors, getAllCategories, getTheFilter, getTheFilterBooks, getTheFilterAuthors };

