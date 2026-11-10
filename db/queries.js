import pool from "./pool.js";

async function getAllBooks() {
  const { rows } = await pool.query(
    "SELECT books.name AS bookName, books.synopsis, ARRAY_AGG(DISTINCT authors.name) As authorName, ARRAY_AGG(DISTINCT genre.name) AS genreName, bookImage FROM books" +
      " LEFT JOIN book_author ON books.id = book_author.book_id" +
      " LEFT JOIN authors ON author_id = authors.id" +
      " LEFT JOIN genre_book ON books.id = genre_book.book_id" +
      " LEFT JOIN genre ON genre_id = genre.id" +
      " GROUP BY" +
      " bookName," +
      " synopsis," +
      " bookImage;",
  );
  return rows;
}

async function getAllAuthors() {
  const { rows } = await pool.query(
    "SELECT authors.name AS authorName, authors.age AS authorAge, authors.status AS authorStatus, authors.authorimage as authorImage, authors.bio AS authorBio ,ARRAY_AGG(DISTINCT books.name) AS authorbooks FROM authors" +
      " LEFT JOIN book_author ON authors.id = book_author.author_id" +
      " LEFT JOIN books ON book_author.book_id = books.id" +
      " GROUP BY" +
      " authorName," +
      " authorAge," +
      " authorStatus," +
      " authorImage," +
      " authorBio;",
  );
  return rows;
}

async function getAllCategories() {
  const { rows } = await pool.query("SELECT category_name FROM categories;");
  return rows;
}

async function getTheFilter(filter) {
  const { rows } = await pool.query(
    "SELECT * FROM categories" + " WHERE category_name = $1;",
    [filter],
  );
  return rows;
}

async function getTheFilterBooks(filters) {
  let query = '';
  const conditions = [];
  const values = [];

  for (const [filter, value] of filters) {
    if (filter === "authors.name") {
      values.push(value);
      conditions.push(`authors.name = $${values.length}`);
    }

    if (filter === "genre.name") {
      values.push(value);
      conditions.push(`$${values.length} IN (genre.name)`);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  console.log("conditions: ", conditions);
  console.log("values: ", values);
  console.log("where: ", where);

  console.log("filters: ", filters);

  query = `
    SELECT books.name AS bookName, books.synopsis, ARRAY_AGG(DISTINCT authors.name) As authorName, ARRAY_AGG(DISTINCT genre.name) AS genreName, bookImage FROM books 
      LEFT JOIN book_author ON books.id = book_author.book_id 
      LEFT JOIN authors ON author_id = authors.id 
      LEFT JOIN genre_book ON books.id = genre_book.book_id 
      LEFT JOIN genre ON genre_id = genre.id 
      ${where}
      GROUP BY bookName, synopsis, bookImage;
    `;


  console.log("query: ", query);

  const { rows } = await pool.query(query, values);

  console.log("rows: ", rows);

  return rows;
}

async function getTheFilterAuthors(filters) {
  const conditions = [];
  const values = [];

  for (const [filter, value] of filters) {
    if (filter === "authors.name") {
      values.push(value);
      conditions.push(`authors.name LIKE $${values.length}`);
    }

    if (filter === "authors.age") {
      values.push(value);
      conditions.push(`authors.age = $${values.length}`);
    }

    if (filter === "authors.status") {
      values.push(value);
      conditions.push(`authors.status = $${values.length}`);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

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

async function addOneAuthor(name, age, status, bio, books) {
  let ageToNumber = parseInt(age);
  let statusToBoolean = status === "true" ? true : false;
  await pool.query(
    `
    INSERT INTO authors (name, age, status, bio)
    VALUES 
      ($1, $2, $3, $4);
    `,
    [name, ageToNumber, statusToBoolean, bio],
  );

  if (books !== undefined) {
    console.log("books: ", books);
    let { rows } = await pool.query(
      `
        SELECT id FROM authors
         WHERE name = $1 AND bio = $2
        `,
      [name, bio],
    );
    console.log("idNewAuthor: ", rows[0].id);

    if (typeof books === "string") {
      console.log("I ENTER THE BOOKS IF");
      Number(books);
      console.log("NOW BOOKS IS A NUMBER: ", books);
      await pool.query(
        `
        INSERT INTO book_author (book_id, author_id)
        VALUES
          ($1, $2)
        `,
        [books, rows[0].id],
      );
    } else {
      for (let i = 0; i < books.length; i++) {
        console.log("books for: ", books[i]);
        await pool.query(
          `
          INSERT INTO book_author (book_id, author_id)
          VALUES
            ($1, $2)
          `,
          [books[i], rows[0].id],
        );
      }
    }
  }

  return;
}

async function getAllGenresName() {
  const { rows } = await pool.query("SELECT * FROM genre;");
  return rows;
}

async function getAllAuthorsName() {
  const { rows } = await pool.query("SELECT id, name FROM authors;");
  return rows;
}

async function getAllBooksName() {
  const { rows } = await pool.query(`SELECT id, name FROM books;`);
  return rows;
}

async function addOneBook(name, synopsis, genres, newGenre, authors) {
  console.log("name: ", name);
  console.log("synopsis: ", synopsis);
  await pool.query(
    `
    INSERT INTO books (name, synopsis)
    VALUES
      ($1, $2);
    `,
    [name, synopsis],
  );

  if (genres !== undefined) {
    console.log("genres: ", genres);
    let { rows } = await pool.query(
      `
      SELECT id FROM books 
      WHERE name = $1 AND synopsis = $2
      `,
      [name, synopsis],
    );
    console.log("idNewBook: ", rows[0].id);
    console.log("THE TYPE OF THE GENRE: ", typeof genres);

    if (typeof genres === "string") {
      console.log("I ENTER THE IF");
      Number(genres);
      console.log("NOW GENRES IS A NUMBER: ", genres);
      await pool.query(
        `
        INSERT INTO genre_book (book_id, genre_id)
        VALUES
          ($1, $2);
        `,
        [rows[0].id, genres],
      );
    } else {
      for (let i = 0; i < genres.length; i++) {
        console.log("genres for: ", genres[i]);
        await pool.query(
          `
          INSERT INTO genre_book (book_id, genre_id)
          VALUES
            ($1, $2);
          `,
          [rows[0].id, genres[i]],
        );
      }
    }
  }

  if (newGenre !== undefined) {
    console.log("newGenre: ", newGenre);
    let { rows } = await pool.query(
      `
      SELECT id FROM books
      WHERE name = $1 AND synopsis = $2
      `,
      [name, synopsis],
    );
    console.log("idNewBook: ", rows[0].id);
    console.log("NewGenreType: ", typeof newGenre);
    console.log("Equal: ", typeof newGenre === "string");
    if (typeof newGenre === "string") {
      console.log("I enter the if");
      await pool.query(
        `
        INSERT INTO genre (name)
        VALUES 
          ($1);
        `,
        [newGenre],
      );

      let NewGenreId = await pool.query(
        `
        SELECT id FROM genre
        WHERE name = $1
        `,
        [newGenre],
      );

      await pool.query(
        `
        INSERT INTO genre_book (book_id, genre_id)
        VALUES
         ($1, $2);
        `,
        [rows[0].id, NewGenreId.rows[0].id],
      );
    } else {
      for (let i = 0; i < newGenre.length; i++) {
        console.log("newGenre for: ", newGenre[i]);
        await pool.query(
          `
          INSERT INTO genre (name)
          VALUES 
            ($1)
          `,
          [newGenre[i]],
        );

        let NewGenreId = await pool.query(
          `
          SELECT id FROM genre
          WHERE name = $1
          `,
          [newGenre[i]],
        );

        await pool.query(
          `
          INSERT INTO genre_book (book_id, genre_id)
          VALUES
          ($1, $2);
          `,
          [rows[0].id, NewGenreId.rows[0].id],
        );
      }
    }
  }

  if (authors !== undefined) {
    console.log("authors: ", authors);
    let { rows } = await pool.query(
      `
      SELECT id FROM books
      WHERE name = $1 AND synopsis = $2  
      `,
      [name, synopsis],
    );
    console.log("idNewBook: ", rows[0].id);

    if (typeof authors === "string") {
      console.log("I ENTER THE AUTHORS IF");
      Number(authors);
      console.log("NOW AUTHORS IS A NUMBER: ", authors);
      await pool.query(
        `
        INSERT INTO book_author (book_id, author_id)
        VALUES
          ($1, $2)
        `,
        [rows[0].id, authors],
      );
    } else {
      for (let i = 0; i < authors.length; i++) {
        console.log("authors for: ", authors[i]);
        await pool.query(
          `
          INSERT INTO book_author (book_id, author_id)
          VALUES
            ($1, $2)
          `,
          [rows[0].id, authors[i]],
        );
      }
    }
  }
  return;
}

async function findBookByTitle(title) {
  const { rows } = await pool.query(
    `
    SELECT books.name FROM books
     WHERE books.name = $1;
    `,
    [title],
  );

  return rows;
}

async function findBookBySynopsis(synopsis) {
  const { rows } = await pool.query(
    `
    SELECT books.synopsis FROM books
     WHERE books.synopsis = $1;
    `,
    [synopsis],
  );

  return rows;
}

async function findAuthorByName(name) {
  const { rows } = await pool.query(
    `
    SELECT authors.name FROM authors
     WHERE authors.name = $1;
    `,
    [name],
  );

  return rows;
}

async function findAuthorByBiography(biography) {
  const { rows } = await pool.query(
    `
    SELECT authors.bio FROM authors
     WHERE authors.bio = $1
    `,
    [biography],
  );

  return rows;
}

async function getSpecificAuthorsName() {
  const { rows } = await pool.query(`
    SELECT DISTINCT name FROM authors;
    `);

  return rows;
}

async function getSpecificAuthorsAge() {
  const { rows } = await pool.query(`
    SELECT DISTINCT age FROM authors;
    `);

  return rows;
}

async function findCategoryByName(name) {
  const { rows } = await pool.query(`
    SELECT category_name FROM categories
      WHERE category_name = $1;
    `, [name]);
  
  return rows;
}

async function findAuthorByAgeCheckbox(ages) {
  console.log("ages: ", ages);
  if(typeof ages === "string") {
    const { rows } = await pool.query(`
      SELECT authors.age FROM authors
        WHERE authors.age = $1;
      `, [ages]);
    
    console.log("The rows ages: ", rows);

    if(rows.length === 0) {
      return 0;
    }
    return 1;

  } else {
    const conditions = [];
    const values = [];

    for (let i = 0; i < ages.length; i++) {
      values.push(ages[i]);
      conditions.push(`authors.age = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" OR ")}` : "";

    const query = `
      SELECT authors.age FROM authors
        ${where}
      `;

    console.log("the ages query: ", query);

    const { rows } = await pool.query(query, values);
    if(rows.length !== values.length) {
      return 0;
    }
    return 1;
  }
}

async function findBookByGenreCheckbox(genres) {
  console.log("genres: ", genres);
  if(typeof genres === "string") {
    const { rows } = await pool.query(`
      SELECT genre.name FROM genre
        WHERE genre.name = $1;
      `, [genres]);
    
    console.log("The rows genres: ", rows);

    if(rows.length === 0) {
      return 0;
    }
    return 1;
    
  } else {
    const conditions = [];
    const values = [];

    for (let i = 0; i < genres.length; i++) {
      values.push(genres[i]);
      conditions.push(`genre.name = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" OR ")}` : "";

    const query = `
      SELECT genre.name FROM genre
        ${where}
      `;

    console.log("the query genre: ", query);

    const { rows } = await pool.query(query, values);

    console.log("The rows genre: ", rows);
    if(rows.length !== values.length) {
      return 0;
    }
    return 1;
  }
}

async function findAuthorByNameCheckbox(names) {
  console.log("names: ", names);
  if(typeof names === "string") {
    const { rows } = await pool.query(`
      SELECT authors.name FROM authors
        WHERE authors.name = $1;
      `, [names]);
    
    console.log("The rows names: ", names);

    if(rows.length === 0) {
      return 0;
    }
    return 1;
    
  } else {
    const conditions = [];
    const values = [];

    for (let i = 0; i < names.length; i++) {
      values.push(names[i]);
      conditions.push(`authors.name = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" OR ")}` : "";

    const query = `
      SELECT authors.name FROM authors
        ${where}
      `;

    console.log("the query names: ", query);
    console.log("the query values: ", values);

    const { rows } = await pool.query(query, values);

    console.log("The rows names: ", rows);
    if(rows.length !== values.length) {
      return 0;
    }
    return 1;
  }
}

export {
  getAllBooks,
  getAllAuthors,
  getAllCategories,
  getTheFilter,
  getTheFilterBooks,
  getTheFilterAuthors,
  addOneAuthor,
  getAllGenresName,
  getAllAuthorsName,
  getAllBooksName,
  addOneBook,
  findBookByTitle,
  findBookBySynopsis,
  findAuthorByBiography,
  findAuthorByName,
  getSpecificAuthorsAge,
  getSpecificAuthorsName,
  findCategoryByName,
  findAuthorByAgeCheckbox,
  findBookByGenreCheckbox,
  findAuthorByNameCheckbox,
};
