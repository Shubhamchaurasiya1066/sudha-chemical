import pg from 'pg';

const { Pool, types } = pg;

// PostgreSQL returns BIGINT values (including COUNT(*)) as strings by default.
types.setTypeParser(20, (value) => Number(value));

function sslConfig() {
  const setting = process.env.DB_SSL?.toLowerCase();

  if (['false', 'disable', 'off', '0'].includes(setting)) return false;

  const host = process.env.DB_HOST || process.env.PGHOST || '';
  if (['localhost', '127.0.0.1', '::1'].includes(host)) return false;

  return {
    rejectUnauthorized:
      process.env.DB_SSL_REJECT_UNAUTHORIZED?.toLowerCase() === 'true',
  };
}

let pool = global.postgresPool;

if (!pool) {
  const connectionString = process.env.DATABASE_URL;

  pool = new Pool({
    ...(connectionString
      ? { connectionString }
      : {
          host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
          database: process.env.DB_DATABASE || process.env.PGDATABASE || 'sudha_chemicals',
          user: process.env.DB_USER || process.env.PGUSER || 'postgres',
          password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
          port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
        }),
    ssl: sslConfig(),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  if (process.env.NODE_ENV !== 'production') {
    global.postgresPool = pool;
  }
}

function postgresPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

// Preserve the existing query({ query, values }) interface used by every API.
export async function query({ query: sql, values = [] }) {
  try {
    const result = await pool.query(postgresPlaceholders(sql), values);
    return result.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}
