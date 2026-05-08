const mysql = require("mysql2");
const url = require("url");

// Parse DATABASE_URL connection string
const dbUrl = new url.URL(process.env.DATABASE_URL);

const db = mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // Remove leading slash
  port: dbUrl.port || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB ERROR:", err);
    process.exit(1); // important
  }
  console.log("✅ DB Connected");
});

module.exports = db;