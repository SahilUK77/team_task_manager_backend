const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// CREATE TEAM (ADMIN ONLY)
router.post("/", verifyToken, isAdmin, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.length < 3) return res.status(400).json({ error: 'Invalid name' });

    db.query(
      "INSERT INTO teams (name, admin_id) VALUES (?, ?)",
      [name, req.user.id],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Team creation failed' });
        }
        // Auto-add admin as member
        db.query("INSERT INTO team_members (team_id, user_id) VALUES (?, ?)", [result.insertId, req.user.id]);
        res.status(201).json({ id: result.insertId, message: 'Team created' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ADD MEMBER TO TEAM (team admin check)
router.post("/add-member", verifyToken, (req, res) => {
  try {
    const { team_id, user_id } = req.body;
    if (!team_id || !user_id) return res.status(400).json({ error: 'Missing ids' });

    // Check if requester is team admin
    db.query("SELECT 1 FROM teams t JOIN team_members tm ON t.admin_id = tm.user_id WHERE t.id=? AND tm.user_id=?", [team_id, req.user.id], (err, result) => {
      if (err || result.length === 0) return res.status(403).json({ error: 'Admin only' });

      db.query(
        "INSERT IGNORE INTO team_members (team_id, user_id) VALUES (?, ?)",
        [team_id, user_id],
        (err) => {
          if (err) return res.status(500).json({ error: 'Add failed' });
          res.json({ message: 'User added to team' });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET MY TEAMS
router.get("/", verifyToken, (req, res) => {
  db.query(
    "SELECT t.*, u.name as admin_name FROM teams t JOIN team_members tm ON t.id = tm.team_id JOIN users u ON t.admin_id = u.id WHERE tm.user_id = ?",
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch teams' });
      res.json(result);
    }
  );
});

// GET TEAM MEMBERS
router.get("/:teamId/members", verifyToken, (req, res) => {
  const teamId = req.params.teamId;
  // Check membership
  db.query("SELECT 1 FROM team_members WHERE team_id=? AND user_id=?", [teamId, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    db.query(
      "SELECT users.id, users.name, users.email FROM team_members JOIN users ON users.id = team_members.user_id WHERE team_id=?",
      [teamId],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Fetch failed' });
        res.json(result);
      }
    );
  });
});

module.exports = router;
