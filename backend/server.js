const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
// app.use(cors());
app.use(cors({
  origin: 'https://magenta-clafoutis-bb349d.netlify.app/' // or Netlify URL
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("dashboard.db");

db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT,
  completed INTEGER
)`);

// GET all tasks
app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST add task
app.post("/tasks", (req, res) => {
  const title = req.body.title;
  db.run("INSERT INTO tasks (title, completed) VALUES (?, 0)", [title], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(200);
  });
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(this.changes ? 200 : 404);
  });
});

// PUT update task
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, completed } = req.body;

  const fields = [];
  const values = [];
  if (title !== undefined) { fields.push("title = ?"); values.push(title); }
  if (completed !== undefined) { fields.push("completed = ?"); values.push(completed); }

  if (fields.length === 0) return res.status(400).json({ error: "Nothing to update" });

  values.push(id);
  const sql = `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`;

  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.sendStatus(this.changes ? 200 : 404);
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
