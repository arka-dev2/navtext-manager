const messageDAO = require("../Dao/MessageDAO.js");
const PageDetected = require("./PageDetected.js");
const loading = require("loading-cli");

class MessageManager {
  constructor() {
    this.pageDetected = new PageDetected();
  }

  //questa funzione serve per prendersi il numero di tutte le pagine con i navtex di oggi
  async getPageNumber2() {
    const load = loading("conteggio delle pagine").start();
    const pageNumber = await this.pageDetected.getPageNumber2();
    load.stop();
    return pageNumber;
  }

  //questa funzione serve per prendersi il numero di tutte le pagine di marine-safety
  async getPageNumber() {
    const load = loading("conteggio delle pagine").start();
    const pageNumber = await this.pageDetected.getPageNumber();
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
        !this.checkMessage(message) ||
        message.type === "TECHNICAL DIFFICULTIES" ||
        message.type === "ADMINISTRATIVE" ||
        message.type === "TEST" ||
        message.navarea === null
      )
        continue;
      acceptedMessages.push(message);
    }
    return acceptedMessages;
  }

  async insertIntoDB(messages) {
    for (let message of messages) {
      this.deleteMessageByReference(message);
      messageDAO.insertMessage(message);
    }
  }

  checkMessage(message) {
    return messageDAO.getMessage(message.link) === null;
  }

  deleteMessageByReference(message) {
    const messageSupp = messageDAO.getMessageFromReference(
      message.navarea,
      message.reference
    );
    if (messageSupp !== null) messageDAO.delateMessage(messageSupp);
  }
}

module.exports = new MessageManager();
