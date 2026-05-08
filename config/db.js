const mysql = require("mysql2");

const db = mysql.createConnection(process.env.DATABASE_URL);

db.connect((err) => {
  if (err) {
    console.error("❌ DB ERROR:", err);
    process.exit(1); // important
  }
  console.log("✅ DB Connected");
});

module.exports = db;