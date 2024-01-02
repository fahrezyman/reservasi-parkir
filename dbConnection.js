const mysql = require("mysql");

// Configuration for MySQL database connection
const dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "epark",
});

// Connect to the database
dbConnection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

module.exports = dbConnection;
