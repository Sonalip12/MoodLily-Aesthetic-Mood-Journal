const express = require("express");

const router = express.Router();

const {
  addMood,
  getMoodSummary,
} = require("../controllers/moodController");

router.post("/add", addMood);
router.get("/summary", getMoodSummary);

module.exports = router;