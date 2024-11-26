const messageDAO = require("../Dao/MessageDAO.js");
const PageDetected = require("./PageDetected.js");
const axios = require("axios");

class MessageManager {
  constructor() {
    this.linkDB = messageDAO.getAllMessage().map((el) => el.link);
    this.pageDetected = new PageDetected();
  }

  async getPageNumber() {
    return await this.pageDetected.getPageNumber2(this.linkDB);
  }

  async getMessageInPage(page) {
    const link = `https://marinesafety.net/?query-52-page=${page}`;
    return await this.pageDetected.getMessagesArr(link);
  }

  async insertIntoDB(messages) {
    for (let message of messages) {
      if (!this.linkDB.includes(message.link)) {
        messageDAO.insertMessage(message);
      }
    }
  }

  close() {
    conn.dispose();
  }
}

module.exports = new MessageManager();
