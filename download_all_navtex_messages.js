//lo script scarica tutti i navtex dal sito marine safety
const cliProgress = require("cli-progress");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const messages = [];
let navtexObj = new Set();

(async () => {
  await getLinkNavtex();
  await downloadMessages();
  writeMessagesInFile();
})();

async function getLinkNavtex() {
  let pageNumber = await getPageNumber();

  //----    inizializzazione della progressbar    ----
  const data = {};
  data.totalStep = pageNumber;
  data.currentStep = 0;
  createProgressBar(data, "pagine");

  for (let i = 1; i <= pageNumber; i++) {
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
  console.log("download dei messaggi");
  const linkNavTex = navtexObj.map((el) => el.link);

  //----    inizializzazione della progressbar    ----
  const data = {};
  data.totalStep = linkNavTex.length;
  data.currentStep = 0;
  createProgressBar(data, "messaggi");

  for (let hrefValue of linkNavTex) {
    data.currentStep++;
    try {
      const { data: html } = await axios.get(hrefValue);
      const $ = cheerio.load(html);
      let message = $(
        "div.entry-content.alignfull.wp-block-post-content.is-layout-constrained.wp-block-post-content-is-layout-constrained"
      ).text();
      message = message.replaceAll("\n", " ");
      messages.push(message);
    } catch (e) {
      console.log(e);
    }
  }
}

function writeMessagesInFile(fileUrl) {
  let output = "[\n";
  for (let message of messages) output += '\t"' + message + '",\n';
  if (output.length > 2)
    output = output.substring(0, output.length - 2) + "\n]";
  else output = output.substring(0, output.length - 1) + "]";
  fs.writeFileSync("messages_navtex/message.json", output);
}

function createProgressBar(data, desc) {
  const progressBar = new cliProgress.SingleBar({
    format: "Progress |{bar}| {value}/{total} " + desc,
    barCompleteChar: "\u2588", // carattere per la parte completata
    barIncompleteChar: "\u2591", // carattere per la parte incompleta
    hideCursor: false, // nasconde il cursore durante l'esecuzione
  });

  // Imposta il totale
  progressBar.start(data.totalStep, data.currentStep); // inizializza con valore iniziale 0

  // Simula un processo incrementale
  const interval = setInterval(() => {
    progressBar.update(data.currentStep);
    if (data.currentStep >= data.totalStep) {
      clearInterval(interval);
      progressBar.stop();
      console.log("completato!");
    }
  }, 100);
}

function convertToObject(objs) {
  const arr = [];
  for (let obj of objs) {
    arr.push(JSON.parse(obj));
  }
  return arr;
}
