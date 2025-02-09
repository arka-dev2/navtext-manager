//lo script scarica tutti i navtex dal sito marine safety
const ProgressBar = require("./Object/Utiles/ProgressBar.js");
const messageManager = require("./Object/Manager/MessageManager.js");
const conn = require("./Object/Utiles/conn.js");

(async () => {
  const pageNumber = await messageManager.getPageNumberAllMessages();
  const progressBar = new ProgressBar(pageNumber, "pagine", "download dei navtex");

  for (let i = 1; i <= pageNumber; i++) {
    try {
      const messages = await messageManager.getMessageInPage(i);
      messageManager.insertIntoDB(messages);
    } catch (err) {
      console.error("Errore nel caricamento della pagina:", err);
    }
    progressBar.updatedOneStep();
  }
  progressBar.complete();
  conn.dispose();
})();
