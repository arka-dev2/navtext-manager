const conn = require("../conn");

class MessageDAO {
  getAllMessage(callback) {
    conn.query("SELECT * FROM messages", (error, results) => {
      if (error) {
        return callback(error, null);
      }
      callback(null, results);
    });
  }
}

module.exports = new MessageDAO();
