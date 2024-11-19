const mysql = require("mysql");
const { parseFile } = require("key-value-file");

(async () => {
  const kv = await parseFile("config/configDB.ini");
  // Crea la connessione al database
  const conn = mysql.createConnection({
    host: kv.get("host"),
    user: kv.get("user"),
    password: kv.get("password"),
    database: kv.get("db"),
    port: kv.get("port"),
  });
  console.log(conn);
})();
