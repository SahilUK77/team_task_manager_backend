const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");  // Admin optional

router.post("/", verifyToken, (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    db.query(
      "INSERT INTO projects (title, description, created_by) VALUES (?, ?, ?)",
      [title, description || '', req.user.id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Project creation failed' });
        }
        res.status(201).json({ id: result.insertId, message: 'Project created' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM projects WHERE created_by = ? OR id IN (SELECT project_id FROM tasks WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id=?)) ORDER BY created_at DESC",
    [req.user.id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch projects' });
      res.json(result);
    }
  );
});

router.get("/:id", verifyToken, (req, res) => {
  db.query("SELECT * FROM projects WHERE id = ? AND (created_by = ? OR EXISTS(SELECT 1 FROM tasks t JOIN team_members tm ON t.team_id = tm.team_id WHERE t.project_id = projects.id AND tm.user_id = ?))", 
    [req.params.id, req.user.id, req.user.id],
    (err, result) => {
      if (err || result.length === 0) return res.status(404).json({ error: 'Project not found' });
      res.json(result[0]);
    }
  );
});

module.exports = router;

