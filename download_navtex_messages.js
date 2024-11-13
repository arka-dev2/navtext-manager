//lo script scarica i navtex solo di oggi
const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const messages = [];
const linkNavTex = [];
let page;

(async () => {
  const browser = await puppeteer.launch();
  page = await browser.newPage();
  // await page.screenshot({ path: "screenshot.png" });
  await getLinkNavtex();
  // await downloadMessages();
  // writeMessagesInFile();

  await browser.close();
})();

async function getLinkNavtex() {
  // const pageNumber = await getPageNumber();
  const pageNumber = 40;
  for (let i = 1; i <= pageNumber; i++) {
    await page.goto(`https://marinesafety.net/?query-52-page=${i}`);
    let links = await page.$$(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div > div:nth-child(3) > h4 > a"
    );
    for (let link of links) {
      let href = await link.getProperty("href");
      let hrefValue = await href.jsonValue();
      linkNavTex.push(hrefValue);
    }
  }
}

async function getPageNumber() {
  await page.goto(`https://marinesafety.net/`);
  const element = await page.$(
    "body > div.wp-site-blocks > div > div:nth-child(2) > div > nav > div > a:nth-child(5)"
  );
  const innerHTML = await page.evaluate((el) => el.innerHTML, element);
  const pageNumber = Number(innerHTML.replaceAll(",", "."));
  return pageNumber;
}

async function downloadMessages() {
  for (let hrefValue of txtFileLinks) {
    console.log("download : " + hrefValue);
    const message = await downloadFileToVariable(hrefValue);
    messages.push(message);
  }
}

async function downloadFileToVariable(fileUrl) {
  try {
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    return response.data.toString("utf-8");
  } catch (error) {
    console.error("Errore durante il download:", error);
  }
}

function writeMessagesInFile(fileUrl) {
  let output = "[\n";
  for (let message of messages) {
    message = message.replaceAll("\n", " ").replaceAll("\r", "");
    if (!message.endsWith("NNNN"))
      message = message.substring(0, message.length - 1);
    output += '\t"' + message + '",\n';
  }
  output = output.substring(0, output.length - 2) + "\n]";
  fs.writeFileSync("messages_navtex/message.json", output);
}
