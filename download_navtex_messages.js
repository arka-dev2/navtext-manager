//lo script scarica tutti i navtex dal sito marine safety del giorni corrente
const ProgressBar = require("./Object/ProgressBar.js");
const messageManager = require("./Object/MessageManager.js");
const reportManager = require("./Object/ReportManager.js");
const conn = require("./Object/conn");

async function main() {
  const allMessages = [];
  const pageNumber = await messageManager.getPageNumber();
  const progressBar = new ProgressBar(
    pageNumber,
    "pagine",
    "download dei navtex"
  );

  for (let i = 1; i <= pageNumber; i++) {
    try {
      const messages = await messageManager.getMessageInPage(i);
      for (let message of messages) allMessages.push(message);
      messageManager.insertIntoDB(messages);
    } catch (err) {
      console.error("Errore nel caricamento della pagina:", err);
    }
    progressBar.updatedOneStep();
  }
  progressBar.complete();
  conn.dispose();
}

main();
setInterval(() => {
  main();
}, 3600000);
