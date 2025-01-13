//lo script scarica tutti i navtex dal sito marine safety del giorni corrente
const ProgressBar = require("./Object/Utiles/ProgressBar.js");
const messageManager = require("./Object/MessageManager.js");
const reportManager = require("./Object/ReportManager.js");
const askMeDeskManager = require("./Object/AskMeDeskManager.js");
const conn = require("./Object/Utiles/conn.js");

async function main() {
  let allMessages = [];
  const pageNumber = await messageManager.getPageNumber2();
  const progressBar = new ProgressBar(
    pageNumber,
    "pagine",
    "download dei navtex"
  );

  for (let i = 1; i <= pageNumber; i++) {
    try {
      const messages = await messageManager.getMessageInPage(i);
      allMessages = allMessages.concat(messages);
    } catch (err) {
      console.error("Errore nel caricamento della pagina:", err);
    }
    progressBar.updatedOneStep();
  }
  progressBar.complete();
  messageManager.insertIntoDB(allMessages);

  // allMessages = messageManager.getMessageToSend();
  // await askMeDeskManager.putMessages(allMessages);
  conn.dispose();
}

main();
setInterval(() => {
  main();
}, 3600000);
