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

module.exports = {
  addMood,
};