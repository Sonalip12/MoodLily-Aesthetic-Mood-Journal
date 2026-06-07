const normalizeSql = (sql) =>
  String(sql || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const createInMemoryDb = () => {
  const state = {
    users: [],
    moods: [],
    journals: [],
    ids: {
      user: 1,
      mood: 1,
      journal: 1,
    },
  };

  const nowIso = () => new Date().toISOString();

  return {
    type: "memory",

    serialize(callback) {
      callback();
    },

    run(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      const cb = typeof params === "function" ? params : callback;
      const query = normalizeSql(sql);

      if (query.startsWith("create table")) {
        if (cb) cb.call({}, null);
        return;
      }

      if (query.includes("insert into users")) {
        const [username, email, password] = values;

        if (state.users.some((u) => u.email === email)) {
          if (cb) cb.call({}, new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email"));
          return;
        }

        const user = {
          id: state.ids.user++,
          username,
          email,
          password,
        };

        state.users.push(user);
        if (cb) cb.call({ lastID: user.id }, null);
        return;
      }

      if (query.includes("insert into moods")) {
        const [user_id, mood] = values;
        const moodRow = {
          id: state.ids.mood++,
          user_id: Number(user_id),
          mood,
          created_at: nowIso(),
        };

        state.moods.push(moodRow);
        if (cb) cb.call({ lastID: moodRow.id }, null);
        return;
      }

      if (query.includes("insert into journals")) {
        const [user_id, title, content, mood] = values;
        const journal = {
          id: state.ids.journal++,
          user_id: Number(user_id),
          title,
          content,
          mood,
          created_at: nowIso(),
        };

        state.journals.push(journal);
        if (cb) cb.call({ lastID: journal.id }, null);
        return;
      }

      if (cb) cb.call({}, null);
    },

    get(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      const cb = typeof params === "function" ? params : callback;
      const query = normalizeSql(sql);

      if (query.includes("select * from users where email")) {
        const [email] = values;
        const user = state.users.find((u) => u.email === email);
        if (cb) cb(null, user);
        return;
      }

      if (cb) cb(null, undefined);
    },

    all(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      const cb = typeof params === "function" ? params : callback;
      const query = normalizeSql(sql);

      if (query.includes("from moods") && query.includes("group by mood")) {
        const [user_id] = values;
        const rows = state.moods
          .filter((m) => m.user_id === Number(user_id))
          .reduce((acc, row) => {
            acc[row.mood] = (acc[row.mood] || 0) + 1;
            return acc;
          }, {});

        const summary = Object.entries(rows)
          .map(([mood, count]) => ({ mood, count }))
          .sort((a, b) => b.count - a.count);

        if (cb) cb(null, summary);
        return;
      }

      if (query.includes("from journals") && query.includes("where user_id")) {
        const [user_id] = values;
        const journals = state.journals
          .filter((j) => j.user_id === Number(user_id))
          .sort((a, b) => {
            if (a.created_at === b.created_at) return b.id - a.id;
            return a.created_at < b.created_at ? 1 : -1;
          })
          .map(({ id, title, content, mood, created_at }) => ({
            id,
            title,
            content,
            mood,
            created_at,
          }));

        if (cb) cb(null, journals);
        return;
      }

      if (cb) cb(null, []);
    },
  };
};

const toPgSql = (sql) => {
  let index = 0;
  return String(sql || "").replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
};

const createPostgresDb = (connectionString) => {
  const { Pool } = require("pg");

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  });

  let schemaReadyPromise;

  const ensureSchemaReady = () => {
    if (!schemaReadyPromise) {
      schemaReadyPromise = Promise.all([
        pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT,
            email TEXT UNIQUE,
            password TEXT
          )
        `),
        pool.query(`
          CREATE TABLE IF NOT EXISTS moods (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            mood TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `),
        pool.query(`
          CREATE TABLE IF NOT EXISTS journals (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            title TEXT,
            content TEXT,
            mood TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `),
      ]).catch((error) => {
        schemaReadyPromise = null;
        throw error;
      });
    }

    return schemaReadyPromise;
  };

  return {
    type: "postgres",

    serialize(callback) {
      callback();
    },

    run(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      const cb = typeof params === "function" ? params : callback;
      let query = toPgSql(sql);

      if (/^\s*insert\s+into\s+(users|moods|journals)\b/i.test(query) && !/\breturning\b/i.test(query)) {
        query = `${query.trim()} RETURNING id`;
      }

      pool
        .query("SELECT 1")
        .then(() => ensureSchemaReady())
        .then(() => pool.query(query, values))
        .then((result) => {
          const lastID = result.rows && result.rows[0] ? result.rows[0].id : undefined;
          if (cb) cb.call({ lastID }, null);
        })
        .catch((err) => {
          if (cb) cb.call({}, err);
        });
    },

    get(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      const cb = typeof params === "function" ? params : callback;

      pool
        .query("SELECT 1")
        .then(() => ensureSchemaReady())
        .then(() => pool.query(toPgSql(sql), values))
        .then((result) => {
          if (cb) cb(null, result.rows[0]);
        })
        .catch((err) => {
          if (cb) cb(err);
        });
    },

    all(sql, params, callback) {
      const values = Array.isArray(params) ? params : [];
      const cb = typeof params === "function" ? params : callback;

      pool
        .query("SELECT 1")
        .then(() => ensureSchemaReady())
        .then(() => pool.query(toPgSql(sql), values))
        .then((result) => {
          if (cb) cb(null, result.rows);
        })
        .catch((err) => {
          if (cb) cb(err);
        });
    },
  };
};

const createSqliteDb = () => {
  const sqlite3 = require("sqlite3").verbose();
  const dbPath = process.env.VERCEL ? "/tmp/moodlily.db" : "./moodlily.db";

  return new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Connected to SQLite database 🌸");
    }
  });
};

const initializeSqliteOrMemorySchema = (db) => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE,
        password TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        mood TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS journals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        content TEXT,
        mood TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
};

let db;

if (process.env.DATABASE_URL) {
  try {
    db = createPostgresDb(process.env.DATABASE_URL);
    console.log("Connected to Postgres database 🌸");
  } catch (error) {
    console.warn("Postgres unavailable, trying SQLite fallback:", error.message);
  }
}

if (!db) {
  try {
    db = createSqliteDb();
    initializeSqliteOrMemorySchema(db);
  } catch (error) {
    console.warn("SQLite unavailable, using in-memory DB fallback:", error.message);
    db = createInMemoryDb();
    initializeSqliteOrMemorySchema(db);
  }
}

module.exports = db;