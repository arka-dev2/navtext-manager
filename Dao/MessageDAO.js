const conn = require("../conn");
const Message = require("../Entity/message");

class MessageDAO {
  getAllMessage(callback) {
    const query = "SELECT * FROM messages";
    conn.query(query, (error, results) => {
      if (error) return callback(error, null);
      let messages = [];
      for (let result of results) {
        let message = new Message(
          result.link,
          result.pubblication_date,
          result.type,
          result.text
        );
        console.log(message);
        messages.push(message);
      }
      callback(null, messages);
    });
  }

  getMessage(id, callback) {
    const query = "SELECT * FROM messages where link = ?";
    const values = [id];
    conn.query(query, values, (error, result) => {
      if (error) return callback(error, null);
      let message = null;
      if (result.length !== 0) {
        message = new Message(
          result[0].link,
          result[0].publication_date,
          result[0].type,
          result[0].text
        );
      }
      callback(null, message);
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
    conn.query(query, values, (error) => {
      if (error) return "errore durante l'inserimento nella tabella messages";
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
      conn.query(query, values, (error) => {
        if (error) return "errore durante l'inserimento nella tabella messages";
      });
    }
  }
}

module.exports = new MessageDAO();
