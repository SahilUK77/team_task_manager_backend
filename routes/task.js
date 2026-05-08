const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// CREATE TASK (WITH ASSIGNMENT)
router.post("/", verifyToken, (req, res) => {
  try {
    const { title, project_id, assigned_to, team_id } = req.body;
    if (!title || !team_id) return res.status(400).json({ error: 'Title and team_id required' });

    db.query(
      "INSERT INTO tasks (title, project_id, assigned_to, team_id, status) VALUES (?, ?, ?, ?, 'Todo')",
      [title, project_id || null, assigned_to || null, team_id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Task creation failed' });
        }
        res.status(201).json({ id: result.insertId, message: 'Task created' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET TASKS (ONLY TEAM TASKS + JOIN project/user info)
router.get("/", verifyToken, (req, res) => {
  db.query(
    `SELECT t.*, p.title as project_title, u.name as assigned_name 
     FROM tasks t 
     LEFT JOIN projects p ON t.project_id = p.id 
     LEFT JOIN users u ON t.assigned_to = u.id
     WHERE t.team_id IN (SELECT team_id FROM team_members WHERE user_id=?) 
     ORDER BY t.created_at DESC`,
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch tasks' });
      res.json(result);
    }
  );
});

// UPDATE STATUS
router.put("/:id", verifyToken, (req, res) => {
  try {
    const { status } = req.body;
    if (!['Todo', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check ownership: task exists and user is team member
    db.query(`SELECT t.team_id FROM tasks t JOIN team_members tm ON t.team_id = tm.team_id 
              WHERE t.id=? AND tm.user_id=?`, [req.params.id, req.user.id], (err, result) => {
      if (err || result.length === 0) return res.status(403).json({ error: 'Unauthorized or task not found' });

      db.query(
        "UPDATE tasks SET status=? WHERE id=?",
        [status, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ error: 'Update failed' });
          res.json({ message: 'Status updated' });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
