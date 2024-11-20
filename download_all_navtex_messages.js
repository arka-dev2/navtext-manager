//lo script scarica tutti i navtex dal sito marine safety
const cliProgress = require("cli-progress");
const cheerio = require("cheerio");
const axios = require("axios");
const messageDAO = require("./Dao/MessageDAO.js");
const conn = require("./conn");

const messages = [];
let navtexObj = new Set();

(async () => {
  await getLinkNavtex();
  await downloadMessages();
  insertMessageIntoDB();
  conn.end((err) => {
    if (err) console.log("Errore chiusura connessione:", err);
    else console.log("Connessione chiusa.");
  });
})();

async function getLinkNavtex() {
  // let pageNumber = await getPageNumber();
  let pageNumber = 1;

  //----    inizializzazione della progressbar    ----
  const dataProgressBar = {};
  dataProgressBar.totalStep = pageNumber;
  dataProgressBar.currentStep = 0;
  const progressBar = createProgressBar(
    dataProgressBar,
    "pagine",
    "searching dei link"
  );

  for (let i = 1; i <= pageNumber; i++) {
    progressBar.update(dataProgressBar.currentStep++);
    data.currentStep++;
    try {
      const { data: html } = await axios.get(
        `https://marinesafety.net/?query-52-page=${i}`
      );
      const $ = cheerio.load(html);
      const divs = $(
        "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div"
      );
      $(divs).each((index, div) => {
        const links = $(div).find("a");

        const date = links.eq(0).text();
        const type = links.eq(1).text();
        const link = links.eq(2).attr("href");

        navtexObj.add(JSON.stringify({ date, type, link }));
      });
    } catch (error) {
      console.error("Errore nel caricamento della pagina:", error.message);
    }
  }
  navtexObj = convertToObject(navtexObj);
  console.log("completato !!!");
}

async function getPageNumber() {
  const { data: html } = await axios.get(`https://marinesafety.net/`);
  const $ = cheerio.load(html);
  const element = $(
    "body > div.wp-site-blocks > div > div:nth-child(2) > div > nav > div > a:nth-child(5)"
  );
  const innerHTML = element.text();
  const pageNumber = Number(innerHTML.replaceAll(",", ""));
  return pageNumber;
}

async function downloadMessages() {
  //----    inizializzazione della progressbar    ----
  const dataProgressBar = {};
  dataProgressBar.totalStep = navtexObj.length;
  dataProgressBar.currentStep = 0;
  const progressBar = createProgressBar(
    dataProgressBar,
    "messaggi",
    "download dei messaggi"
  );

  for (let obj of navtexObj) {
    progressBar.update(dataProgressBar.currentStep++);
    try {
      const link = obj.link;
      const publicationDate = obj.date;
      const type = obj.type;

      const { data: html } = await axios.get(link);
      const $ = cheerio.load(html);
      let text = $(
        "div.entry-content.alignfull.wp-block-post-content.is-layout-constrained.wp-block-post-content-is-layout-constrained"
      ).text();
      text = text.replaceAll("\n", " ");

      messages.push({ link, publicationDate, type, text });
    } catch (e) {
      console.log(e);
    }
  }
  console.log("completato !!!");
}

function insertMessageIntoDB() {
  messageDAO.insertAllMessage(messages);
}

function createProgressBar(data, desc, message) {
  console.log(message);
  const progressBar = new cliProgress.SingleBar({
    format: "Progress |{bar}| {value}/{total} " + desc,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: false,
  });

  progressBar.start(data.totalStep, data.currentStep);
  return progressBar;
}

function convertToObject(objs) {
  const arr = [];
  for (let obj of objs) {
    arr.push(JSON.parse(obj));
  }
  return arr;
}
