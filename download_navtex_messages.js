//lo script scarica tutti i navtex dal sito marine safety del giorni corrente
const ProgressBar = require("./Object/Utiles/ProgressBar.js");
const messageManager = require("./Object/Manager/MessageManager.js");
const reportManager = require("./Object/Manager/ReportManager.js");
const askMeDeskManager = require("./Object/Manager/AskMeDeskManager.js");
const conn = require("./Object/Utiles/conn.js");

async function main() {
  let allMessages = [];
  const pageNumber = await messageManager.getPagesNumberToday();
  const progressBar = new ProgressBar(pageNumber, "pagine", "download dei navtex");

  for (let i = 1; i <= pageNumber; i++) {
    try {
      let messages = await messageManager.getMessageInPage(i);
      messages = messageManager.checkMessages(messages);
      allMessages = allMessages.concat(messages);
    } catch (err) {
      console.error("Errore nel caricamento della pagina:", err);
    }
    progressBar.updatedOneStep();
  }
  progressBar.complete();
  messageManager.insertAndDelateIntoDB(allMessages);

  allMessages = messageManager.getMessageToSend();
  await askMeDeskManager.putMessages(allMessages);
  conn.dispose();
}

main();
setInterval(() => {
  main();
}, 3600000);
