const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        db.query("SELECT id FROM users WHERE email = ?", [email], (err, result) => {
            if (result.length > 0) return res.status(400).json({ error: 'Email exists' });

            const hash = bcrypt.hashSync(password, 10);  // Sync for simplicity

            db.query(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name, email, hash],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Signup failed' });
                    }
                    res.status(201).json({ message: 'User created' });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Database error");
            }

            if (!result || result.length === 0) {
                return res.status(404).send("User not found");
            }

            const user = result[0];

            try {
                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    return res.status(401).send("Wrong password");
                }

                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET || "secret"
                );

                res.json({ token, user });
            } catch (error) {
                console.log(error);
                res.status(500).send("Login error");
            }
        }
    );
});

module.exports = router;

