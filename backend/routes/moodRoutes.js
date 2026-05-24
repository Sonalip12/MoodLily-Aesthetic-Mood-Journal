const express = require("express");

const router = express.Router();

const {
  addMood,
} = require("../controllers/moodController");

router.post("/add", addMood);

module.exports = router;