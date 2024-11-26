//lo script scarica tutti i navtex dal sito marine safety del giorni corrente
const ProgressBar = require("./Object/ProgressBar.js");
const messageManager = require("./Object/MessageManager.js");

async function main() {
  const pageNumber = await messageManager.getPageNumber();
  const progressBar = new ProgressBar(
    pageNumber,
    "pagine",
    "download dei navtex"
  );

  for (let i = 1; i <= pageNumber; i++) {
    try {
      const messages = await messageManager.getMessageInPage(i);
      messageManager.insertIntoDB(messages);
    } catch (err) {
      console.error("Errore nel caricamento della pagina:", err.message);
    }
    progressBar.updatedOneStep();
  }
  progressBar.complete();
}

main();
// setInterval(() => {
//   main();
// }, 3600000);
