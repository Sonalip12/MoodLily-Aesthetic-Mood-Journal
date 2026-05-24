require("./database");

const express = require("express");
const session = require("express-session");
const cors = require("cors");

const authRoutes =
  require("./routes/authRoutes");

const moodRoutes =
  require("./routes/moodRoutes");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin:"*",
    credentials:true,
  })
);

app.use(
  session({
    secret:"moodlily_secret",
    resave:false,
    saveUninitialized:false,
  })
);

app.use("/api/auth", authRoutes);

app.use("/api/moods", moodRoutes);

app.get("/", (req,res) => {
  res.send(
    "MoodLily Backend Running 🌸"
  );
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});