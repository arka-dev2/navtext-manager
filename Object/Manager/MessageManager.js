const messageDAO = require("../../Dao/MessageDAO.js");
const pageDetected = require("./PageManager.js");
const loading = require("loading-cli");

class MessageManager {
  //questa funzione serve per prendersi il numero di tutte le pagine con i navtex di oggi
  async getPagesNumberToday() {
    const load = loading("conteggio delle pagine").start();
    const pageNumber = await pageDetected.getPagesNumberToday();
    load.stop();
    return pageNumber;
  }

  //questa funzione serve per prendersi il numero di tutte le pagine di marine-safety
  async getPageNumberAllMessages() {
    const load = loading("conteggio delle pagine").start();
    const pageNumber = await pageDetected.getPageNumberAllMessages();
    load.stop();
    return pageNumber;
  }

  async getMessageInPage(page) {
    const link = `https://marinesafety.net/?query-52-page=${page}`;

    //----    scarto i messaggi di tipo amministrative, test e technical difficulties
    const messages = await pageDetected.getMessagesArr(link);
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
    const messageSupp = messageDAO.getMessageFromReference(message.navarea, message.reference);
    if (messageSupp !== null) {
      messageDAO.delateMessage(messageSupp);
      message.invioLascaux = true;
    }
  }

  getMessageToSend() {
    // const dateString = this.getTodayDateString();
    let message = messageDAO.getMessageToSend();
    return message;
  }

  getTodayDateString() {
    const date = new Date();
    const year = date.getFullYear();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    day = day < 10 ? `0${day}` : `${day}`;
    month = month < 10 ? `0${month}` : `${month}`;
    return `${year}-${month}-${day}`;
  }

  updateInvioLascaux(message) {
    message.invioLascaux = true;
    messageDAO.updateMessage(message);
  }
}

module.exports = new MessageManager();