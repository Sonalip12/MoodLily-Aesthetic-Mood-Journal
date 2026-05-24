const db = require("../database");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (username, email, password)
       VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({
            error: err.message,
          });
        }

        res.json({
          message: "User registered successfully 🌸",
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const validPassword = await bcrypt.compare(
        password,
        user.password
      );

      if (!validPassword) {
        return res.status(401).json({
          error: "Invalid password",
        });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
      };

      res.json({
        message: "Login successful 🌸",
        user: req.session.user,
      });
    }
  );
};

const logout = (req, res) => {
  req.session.destroy();

  res.json({
    message: "Logged out successfully",
  });
};

module.exports = {
  signup,
  login,
  logout,
};