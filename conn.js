const Mysql = require("sync-mysql");

const conn = new Mysql({
  host: "localhost",
  user: "root",
  password: "",
  database: "navtex",
  port: "3306",
  insecureAuth: true,
});

module.exports = conn;
