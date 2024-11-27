const messageDAO = require("../Dao/MessageDAO.js");
const PageDetected = require("./PageDetected.js");
const loading = require("loading-cli");

class MessageManager {
  constructor() {
    this.linkDB = messageDAO.getAllMessage().map((el) => el.link);
    this.pageDetected = new PageDetected();
  }

  async getPageNumber() {
    const load = loading("conteggio delle pagine").start();
    const pageNumber = await this.pageDetected.getPageNumber2(this.linkDB);
    load.stop();
    return pageNumber;
  }

  async getMessageInPage(page) {
    const link = `https://marinesafety.net/?query-52-page=${page}`;
    return await this.pageDetected.getMessagesArr(link);
  }

  async insertIntoDB(messages) {
    for (let message of messages) {
      if (this.checkMessage(message)) {
        messageDAO.insertMessage(message);
      }
    }
  }

  checkMessage(message) {
    return !this.linkDB.includes(message.link);
  }
}

module.exports = new MessageManager();
