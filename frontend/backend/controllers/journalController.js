const db = require("../database");

const createJournal = (req, res) => {

  const { user_id, title, content, mood } = req.body;

  if (!user_id || !title || !content) {
    return res.status(400).json({
      error: "user_id, title, and content are required",
    });
  }

  db.run(
    `
    INSERT INTO journals (user_id, title, content, mood)
    VALUES (?, ?, ?, ?)
    `,
    [user_id, title, content, mood || "Neutral"],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json({
        message: "Journal saved successfully 🌸",
        journalId: this.lastID,
      });
    }
  );

};

const getJournals = (req, res) => {

  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({
      error: "user_id is required",
    });
  }

  db.all(
    `
    SELECT id, title, content, mood, created_at
    FROM journals
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
    `,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json({ journals: rows });
    }
  );

};

module.exports = {
  createJournal,
  getJournals,
};