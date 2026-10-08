import { Pool } from "pg";

const { PGHOST, PGUSER, PGDATABASE, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: 5432,
});

export default pool;
