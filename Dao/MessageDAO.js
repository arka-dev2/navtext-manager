const conn = require("../Object/conn");
const Message = require("../Entity/message");

class MessageDAO {
  getAllMessage() {
    let messages = [];

    const query = "select * from messages";
    const results = conn.query(query);

    for (let result of results) {
      let message = new Message(
        result.link,
        result.publication_date,
        result.type,
        result.description,
        result.text,
        result.navarea,
        result.reference,
        result.invio_lascaux
      );
      messages.push(message);
    }
    return messages;
  }

  getMessage(id) {
    let message = null;

    const query = "select * from messages where link = ?";
    const values = [id];
    const result = conn.query(query, values);

    if (result.length !== 0) {
      message = new Message(
        result[0].link,
        result[0].publication_date,
        result[0].type,
        result[0].description,
        result[0].text,
        result[0].navarea,
        result[0].reference,
        result[0].invio_lascaux
      );
    }
    return message;
  }

  insertMessage(message) {
    const query =
      "insert into messages (link, publication_date, type, description, text, navarea, reference, invio_lascaux) values(?,?,?,?,?,?,?,?)";
    const values = [
      message.link,
      message.publicationDate,
      message.type,
      message.description,
      message.text,
      message.navarea,
      message.reference,
      message.invioLascaux ? 1 : 0,
    ];
    conn.query(query, values);
  }

  insertAllMessage(messages) {
    const query =
      "insert into messages (link, publication_date, type, description, text, navarea, reference, invio_lascaux) values(?,?,?,?,?,?,?,?)";
    for (let message of messages) {
      const values = [
        message.link,
        message.publicationDate,
        message.type,
        message.description,
        message.text,
        message.navarea,
        message.reference,
        message.invioLascaux ? 1 : 0,
      ];
      conn.query(query, values);
    }
  }

  updateMessage(message) {
    const query =
      "update messages set publication_date = ?, type = ?, description = ?, text = ?, navarea = ?, reference = ?, invio_lascaux = ? where link = ?";
    const values = [
      message.publicationDate,
      message.type,
      message.description,
      message.text,
      message.navarea,
      message.reference,
      message.invioLascaux ? 1 : 0,
      message.link,
    ];
    conn.query(query, values);
  }

  getMessageFromReference(navarea, reference) {
    let message = null;
    const query = "select * from messages where navarea = ? reference = ? ";
    const values = [navarea, reference];
    const result = conn.query(query, values);

    if (result.length !== 0) {
      message = new Message(
        result[0].link,
        result[0].publication_date,
        result[0].type,
        result[0].description,
        result[0].text,
        result[0].navarea,
        result[0].reference,
        result[0].invio_lascaux
      );
    }
    return message;
  }

  delateMessage(message) {
    const query = "delete from messages where link = ?";
    const values = [message.link];
    conn.query(query, values);
  }
}

module.exports = new MessageDAO();
