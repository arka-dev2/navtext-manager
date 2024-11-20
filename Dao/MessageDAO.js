const conn = require("../conn");
const Message = require("../Entity/message");

class MessageDAO {
  getAllMessage(callback) {
    const query = "SELECT * FROM messages";
    conn.query(query, (err, results) => {
      if (err) console.log(err);
      else {
        let messages = [];
        for (let result of results) {
          let message = new Message(
            result.link,
            result.pubblication_date,
            result.type,
            result.text
          );
          messages.push(message);
        }
        callback(messages);
      }
    });
  }

  getMessage(id, callback) {
    const query = "SELECT * FROM messages where link = ?";
    const values = [id];
    conn.query(query, values, (err, result) => {
      if (err) console.log(err);
      else {
        let message = null;
        if (result.length !== 0) {
          message = new Message(
            result[0].link,
            result[0].publication_date,
            result[0].type,
            result[0].text
          );
        }
        callback(message);
      }
    });
  }

  insertMessage(message) {
    const query =
      "insert into messages (link, publication_date, type, text) values(?,?,?,?)";
    const values = [
      message.link,
      message.pubblicationDate,
      message.type,
      message.text,
    ];
    conn.query(query, values, (err) => {
      if (err) return "errore durante l'inserimento nella tabella messages";
    });
  }

  insertAllMessage(messages) {
    const query =
      "insert into messages (link, publication_date, type, text) values(?,?,?,?)";
    for (let message of messages) {
      const values = [
        message.link,
        message.publicationDate,
        message.type,
        message.text,
      ];
      conn.query(query, values, (err) => {
        if (err) return "errore durante l'inserimento nella tabella messages";
      });
    }
  }
}

module.exports = new MessageDAO();
