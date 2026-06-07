require("./database");

const express = require("express");
const session = require("express-session");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  session({
    secret: "moodlily_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);

app.get("/", (req, res) => {
  res.send("MoodLily Backend Running 🌸");
});

module.exports = app;