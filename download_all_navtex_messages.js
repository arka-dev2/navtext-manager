//lo script scarica i navtex solo di oggi
const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const cliProgress = require("cli-progress");
const cheerio = require("cheerio");

const messages = [];
let navtexObj = new Set();
let page;

(async () => {
  const browser = await puppeteer.launch();
  page = await browser.newPage();
  await getLinkNavtex();
  await downloadMessages();
  writeMessagesInFile();

  await browser.close();
})();

async function getLinkNavtex() {
  let pageNumber = await getPageNumber();

  //----    inizializzazione della progressbar    ----
  const data = {};
  data.totalStep = pageNumber;
  data.currentStep = 0;
  createProgressBar(data, "pagine");

  for (let i = 1; i <= pageNumber; i++) {
    data.currentStep = i;
    await page.goto(`https://marinesafety.net/?query-52-page=${i}`);
    let divs = await page.$$(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div "
    );
    for (let div of divs) {
      const htmlContent = await div.evaluate((el) => el.outerHTML);
      let $ = cheerio.load(htmlContent);

      const date = $("a").eq(0).text();
      const type = $("a").eq(1).text();
      const link = $("a").eq(2).attr("href");

      navtexObj.add(JSON.stringify({ date, type, link }));
    }
  }
  navtexObj = convertToObject(navtexObj);
}

async function getPageNumber() {
  await page.goto(`https://marinesafety.net/`);
  const element = await page.$(
    "body > div.wp-site-blocks > div > div:nth-child(2) > div > nav > div > a:nth-child(5)"
  );
  const innerHTML = await page.evaluate((el) => el.innerHTML, element);
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
      await page.goto(hrefValue);
      const elements = await page.$$(
        "#wp--skip-link--target > div > div.wp-block-column.is-layout-constrained.wp-block-column-is-layout-constrained > div.vertical-overlap.wp-block-group.has-header-background-color.has-black-background-color.has-text-color.has-background.has-link-color.wp-elements-36612680afc3b1e1f28572441719f0a2.is-layout-constrained.wp-container-core-group-is-layout-6.wp-block-group-is-layout-constrained > div.entry-content.alignfull.wp-block-post-content.is-layout-constrained.wp-block-post-content-is-layout-constrained > p"
      );
      let message = "";
      for (let element of elements) {
        message += await page.evaluate((el) => el.innerHTML, element);
      }
      message = message.replaceAll("<br>", "");
      message = message.replaceAll("\n", " ");
      if (message.includes("</div>")) {
        const start = message.indexOf("<div");
        const end = message.lastIndexOf("</div>") + 6;
        message =
          message.substring(0, start) + message.substring(end, message.length);
      }
      messages.push(message);
    } catch (e) {
      console.log("errore");
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
