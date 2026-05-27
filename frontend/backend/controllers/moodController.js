const db = require("../database");

const addMood = (req, res) => {

  const { user_id, mood } = req.body;

  db.run(
    `
    INSERT INTO moods (user_id, mood)
    VALUES (?, ?)
    `,
    [user_id, mood],

    function(err){

      if(err){
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        message:
          "Mood saved successfully 🌸"
      });

    }
  );

};

const getMoodSummary = (req, res) => {

  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({
      error: "user_id is required",
    });
  }

  db.all(
    `
    SELECT mood, COUNT(*) AS count
    FROM moods
    WHERE user_id = ?
    GROUP BY mood
    ORDER BY count DESC
    `,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json({ summary: rows });
    }
  );

};

module.exports = {
  addMood,
  getMoodSummary,
};