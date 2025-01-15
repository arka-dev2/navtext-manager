const askMeDeskManager = require("./AskMeDeskManager.js");
const messageDAO = require("../Dao/MessageDAO.js");
const pageDetected = require("./PageManager.js");
const loading = require("loading-cli");

class MessageManager {
  async getPagesNumberToday() {
    const load = loading("conteggio delle pagine").start();
    const pageNumber = await pageDetected.getPagesNumberToday();
    load.stop();
    return pageNumber;
  }

  async getPageNumberAllMessages() {
    const load = loading("conteggio delle pagine").start();
    const pageNumber = await pageDetected.getPageNumberAllMessages();
    load.stop();
    return pageNumber;
  }

  async getMessageInPage(page) {
    const link = `https://marinesafety.net/?query-52-page=${page}`;
    const messages = await pageDetected.getMessagesArr(link);
    return messages;
  }

  checkMessages(messages) {
    const acceptedMessages = [];
    const todayDateString = this.getTodayDateString();
    for (let message of messages) {
      if (
        !this.checkMessageExistDB(message) ||
        message.type === "TECHNICAL DIFFICULTIES" ||
        message.type === "ADMINISTRATIVE" ||
        message.type === "TEST" ||
        message.navarea === null ||
        message.publicationDate !== todayDateString
      )
        continue;
      acceptedMessages.push(message);
    }
    return acceptedMessages;
  }

  insertAndDelateIntoDB(messages) {
    const richiesteToDelete = [];
    for (let message of messages) {
      const messageSupp = messageDAO.getMessageByReference(message.navarea, message.reference);
      if (messageSupp !== null) {
        if (messageSupp.idLascaux !== 0) richiesteToDelete.push(messageSupp.idLascaux);
        messageDAO.delateMessage(messageSupp);
      }
      messageDAO.insertMessage(message);
    }
    if (richiesteToDelete.length !== 0) askMeDeskManager.delateMessages(richiesteToDelete);
  }

  checkMessageExistDB(message) {
    return messageDAO.getMessage(message.link) === null;
  }

  getMessageToSend() {
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
