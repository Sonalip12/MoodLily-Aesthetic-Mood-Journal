require("./database");

const express = require("express");
const session = require("express-session");
const PgStore = require("connect-pg-simple")(session);
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const sessionOptions = {
  secret:
    process.env.SESSION_SECRET ||
    "moodlily_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

if (process.env.DATABASE_URL) {
  sessionOptions.store = new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ssl: process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  });
}

app.use(session(sessionOptions));

app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);

app.get("/", (req, res) => {
  res.send("MoodLily Backend Running 🌸");
});

module.exports = app;