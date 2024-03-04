import express from "express";
import { pool } from "../db/connection.js";

const router = express.Router();


router.get("/users", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.status(200).json(users.rows);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const newUser = await pool.query(
      "INSERT INTO users (name, email) VALUES($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a table
router.get("/create", async (req, res) => {
  try {
    await pool.query(
      "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(50), email VARCHAR(50), cars INT DEFAULT 0)"
    );
    res.status(200).json({ message: "Table created" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
