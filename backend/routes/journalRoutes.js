const express = require("express");
const router = express.Router();

const {
  createJournal,
  getJournals,
} = require("../controllers/journalController");

router.post("/add", createJournal);
router.get("/", getJournals);

module.exports = router;