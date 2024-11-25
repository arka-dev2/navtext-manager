//lo script scarica tutti i navtex dal sito marine safety
const PageDetected = require("./Object/PageDetected.js");
const ProgressBar = require("./Object/ProgressBar.js");
const messageDAO = require("./Dao/MessageDAO.js");
const conn = require("./conn.js");

async function main() {
  const linkDB = messageDAO.getAllMessage().map((el) => el.link);
  const pageDetected = new PageDetected();
  let pageNumber = await pageDetected.getPageNumber2(linkDB);
  const progressBar = new ProgressBar(
    pageNumber,
    "pagine",
    "download dei navtex"
  );

  for (let i = 1; i <= pageNumber; i++) {
    try {
      const link = `https://marinesafety.net/?query-52-page=${i}`;
      const navtexObjArr = await pageDetected.getNavtexObjArr(link);
      for (let navtexObj of navtexObjArr) {
        if (!linkDB.includes(navtexObj.link)) {
          const link = navtexObj.link;
          const publicationDate = navtexObj.date;
          const type = navtexObj.type;
          const text = await pageDetected.dawnloadNavtex(navtexObj.link);
          const message = { link, publicationDate, type, text };
          messageDAO.insertMessage(message);
        }
      }
    } catch (err) {
      console.error("Errore nel caricamento della pagina:", err.message);
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
