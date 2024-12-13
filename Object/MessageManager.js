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

    //----    scarto i messaggi di tipo amministrative, test e technical difficulties
    const messages = await this.pageDetected.getMessagesArr(link);
    const acceptedMessages = [];
    for (let message of messages) {
      if (
        message.type === "TECHNICAL DIFFICULTIES" ||
        message.type === "ADMINISTRATIVE" ||
        message.type === "TEST"
      )
        continue;

      if (message.navarea === "") continue;
      acceptedMessages.push(message);
    }
    return acceptedMessages;
  }

  async insertIntoDB(messages) {
    for (let message of messages) {
      if (this.checkMessage(message)) {
        messageDAO.insertMessage(message);
      }
    }
  }

  checkMessage(message) {
    return messageDAO.getMessage(message.link) === null;
  }
}

module.exports = new MessageManager();
