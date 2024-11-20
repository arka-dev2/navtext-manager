const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "navtex",
  port: "3306",
  insecureAuth: true,
});

module.exports = conn;
