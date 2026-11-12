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
  let conditionsAll = [];
  let query = "";
  let authorConditions;
  let authorHelperConditions = [];
  let ageConditions;
  let ageHelperConditions = [];
  let statusConditions;
  let statusHelperConditions = [];
  let genreConditions = " ";
  let theGenreTotal = 0;
  let genreHelperConditions = [];
  let theFinalValues = [];

  for (const [filter, ...values] of filters) {
    if (filter === "authors.name") {
      for (let i = 0; i < values.length; i++) {
        theFinalValues.push(values[i]);
        authorHelperConditions.push(`authors.name = $${theFinalValues.length}`);
      }
      authorConditions = authorHelperConditions.join(" OR ");
      conditionsAll.push(authorConditions);
    }

    if (filter === "authors.age") {
      for (let i = 0; i < values.length; i++) {
        theFinalValues.push(values[i]);
        ageHelperConditions.push(`authors.age = $${theFinalValues.length}`);
      }
      ageConditions = ageHelperConditions.join(" OR ");
      conditionsAll.push(ageConditions);
    }

    if (filter === "authors.status") {
      for (let i = 0; i < values.length; i++) {
        theFinalValues.push(values[i]);
        statusHelperConditions.push(
          `authors.status = $${theFinalValues.length}`,
        );
      }
      statusConditions = statusHelperConditions.join(" OR ");
      conditionsAll.push(statusConditions);
    }

    if (filter === "genre.name") {
      theGenreTotal = values.length;
      for (let i = 0; i < values.length; i++) {
        theFinalValues.push(values[i]);
        genreHelperConditions.push(`$${theFinalValues.length}`);
      }
      genreConditions = genreHelperConditions.join(" , ");
      genreConditions = `HAVING COUNT(DISTINCT genre.name)
       FILTER (WHERE genre.name IN (`.concat(genreConditions);
      theFinalValues.push(theGenreTotal);
      genreConditions = genreConditions.concat(
        `)) = $${theFinalValues.length}`,
      );
    }
  }

  let helperWhere = conditionsAll.join(" AND ");
  let where = conditionsAll.length !== 0 ? `WHERE `.concat(helperWhere) : " ";

  console.log("author conditions: ", authorConditions);
  console.log("age conditions: ", ageConditions);
  console.log("status conditions: ", statusConditions);
  console.log("genre conditions: ", genreConditions);
  console.log("where: ", where);

  console.log("filters: ", filters);

  query = `
    SELECT books.name AS bookName, books.synopsis, ARRAY_AGG(DISTINCT authors.name) As authorName, ARRAY_AGG(DISTINCT genre.name) AS genreName, bookImage FROM books 
      LEFT JOIN book_author ON books.id = book_author.book_id 
      LEFT JOIN authors ON author_id = authors.id 
      LEFT JOIN genre_book ON books.id = genre_book.book_id 
      LEFT JOIN genre ON genre_id = genre.id 
      ${where}
      GROUP BY bookName, synopsis, bookImage
      ${genreConditions}
    `;

  console.log("query: ", query);
  console.log("values: ", theFinalValues);

  const { rows } = await pool.query(query, theFinalValues);

  console.log("I got a correct query");
  console.log("rows: ", rows);

  return rows;
}

async function getTheFilterAuthors(filters) {
  let conditionsAll = [];
  let authorConditions;
  let authorHelperConditions = [];
  let ageConditions;
  let ageHelperConditions = [];
  let statusConditions;
  let statusHelperConditions = [];
  let theFinalValues = [];

  for (const [filter, ...values] of filters) {
    if (filter === "authors.name") {
      for (let i = 0; i < values.length; i++) {
        theFinalValues.push(values[i]);
        authorHelperConditions.push(`authors.name = $${theFinalValues.length}`);
      }
      authorConditions = authorHelperConditions.join(" OR ");
      conditionsAll.push(authorConditions);
    }

    if (filter === "authors.age") {
      for (let i = 0; i < values.length; i++) {
        theFinalValues.push(values[i]);
        ageHelperConditions.push(`authors.age = $${theFinalValues.length}`);
      }
      ageConditions = ageHelperConditions.join(" OR ");
      conditionsAll.push(ageConditions);
    }

    if (filter === "authors.status") {
      for (let i = 0; i < values.length; i++) {
        theFinalValues.push(values[i]);
        statusHelperConditions.push(
          `authors.status = $${theFinalValues.length}`,
        );
      }
      statusConditions = statusHelperConditions.join(" OR ");
      conditionsAll.push(statusConditions);
    }
  }

  console.log("conditions all: ", conditionsAll);
  let helperWhere = conditionsAll.join(" AND ");
  let where = conditionsAll.length !== 0 ? `WHERE `.concat(helperWhere) : " ";

  console.log("author conditions: ", authorConditions);
  console.log("age conditions: ", ageConditions);
  console.log("status conditions: ", statusConditions);
  console.log("where: ", where);

  console.log("values: ", theFinalValues);

  console.log("filters: ", filters);

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

  console.log("query: ", query);

  const { rows } = await pool.query(query, theFinalValues);

  console.log(rows);

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
  const { rows } = await pool.query(
    `
    SELECT category_name FROM categories
      WHERE category_name = $1;
    `,
    [name],
  );

  return rows;
}

async function findAuthorByAgeCheckbox(ages) {
  console.log("ages: ", ages);
  if (typeof ages === "string") {
    const { rows } = await pool.query(
      `
      SELECT authors.age FROM authors
        WHERE authors.age = $1;
      `,
      [ages],
    );

    console.log("The rows ages: ", rows);

    if (rows.length === 0) {
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
    if (rows.length !== values.length) {
      return 0;
    }
    return 1;
  }
}

async function findBookByGenreCheckbox(genres) {
  console.log("genres: ", genres);
  if (typeof genres === "string") {
    const { rows } = await pool.query(
      `
      SELECT genre.name FROM genre
        WHERE genre.name = $1;
      `,
      [genres],
    );

    console.log("The rows genres: ", rows);

    if (rows.length === 0) {
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
    if (rows.length !== values.length) {
      return 0;
    }
    return 1;
  }
}

async function findAuthorByNameCheckbox(names) {
  console.log("names: ", names);
  if (typeof names === "string") {
    const { rows } = await pool.query(
      `
      SELECT authors.name FROM authors
        WHERE authors.name = $1;
      `,
      [names],
    );

    console.log("The rows names: ", names);

    if (rows.length === 0) {
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
    if (rows.length !== values.length) {
      return 0;
    }
    return 1;
  }
}

async function addOneCategory(
  categoryName,
  categoryFilter,
  categoryNameAuthor,
  categoryAgeAuthor,
  categoryStatusAuthor,
  categoryGenresBook,
) {
  let theCompleteArray = [];
  let nameAuthorArray = [];
  let ageAuthorArray = [];
  let statusAuthorArray = [];
  let genresBookArray = [];

  if (categoryNameAuthor !== undefined) {
    nameAuthorArray =
      typeof categoryNameAuthor === "object"
        ? categoryNameAuthor
        : [...nameAuthorArray, categoryNameAuthor];
    console.log("Author array: ", nameAuthorArray);
    nameAuthorArray.unshift("authors.name");
    console.log("Authors array complete: ", nameAuthorArray);
    theCompleteArray.push(nameAuthorArray);
  }

  if (categoryAgeAuthor !== undefined) {
    ageAuthorArray =
      typeof categoryAgeAuthor === "object"
        ? categoryAgeAuthor
        : [...ageAuthorArray, categoryAgeAuthor];
    console.log("Age array: ", ageAuthorArray);
    ageAuthorArray.unshift("authors.age");
    console.log("Ages array complete: ", ageAuthorArray);
    theCompleteArray.push(ageAuthorArray);
  }

  if (categoryStatusAuthor !== undefined) {
    console.log("status: ", categoryStatusAuthor);
    console.log("the object: ", typeof categoryStatusAuthor);
    statusAuthorArray =
      typeof categoryStatusAuthor === "object"
        ? categoryStatusAuthor
        : [...statusAuthorArray, categoryStatusAuthor];
    console.log("status array: ", statusAuthorArray);
    statusAuthorArray.unshift("authors.status");
    console.log("Status array complete: ", statusAuthorArray);
    theCompleteArray.push(statusAuthorArray);
  }

  if (categoryFilter === "books") {
    if (categoryGenresBook !== undefined) {
      genresBookArray =
        typeof categoryGenresBook === "object"
          ? categoryGenresBook
          : [...genresBookArray, categoryGenresBook];
      console.log("genres array: ", genresBookArray);
      genresBookArray.unshift("genre.name");
      console.log("Category array complete: ", genresBookArray);
      theCompleteArray.push(genresBookArray);
    }
  }

  let theFilterAdd =
    categoryFilter === "books" ? ["table", "books"] : ["table", "authors"];
  theCompleteArray.unshift(theFilterAdd);
  console.log("Array finally complete: ", theCompleteArray);
  console.log("category name: ", categoryName);
  let jsonArray = JSON.stringify(theCompleteArray);
  console.log("the json array: ", jsonArray);

  await pool.query(
    `
    INSERT INTO Categories (category_name, category_filter)
    VALUES
      ($1,$2)
    `,
    [categoryName, jsonArray],
  );
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
  addOneCategory,
};
