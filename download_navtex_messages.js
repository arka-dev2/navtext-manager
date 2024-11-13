//lo script scarica i navtex solo di oggi
const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const messages = [];
const txtFileLinks = [];
let page;

(async () => {
  const date = new Date();
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${
    date.getDate() + 1
  }`;
  const browser = await puppeteer.launch();
  page = await browser.newPage();
  for (let i = 0; i < 2; i++) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let day = date.getDate() - i;
    day = day < 10 ? `0${day}` : day;
    const dateString = `${year}-${month}-${day}`;
    await page.goto(`https://www.navtex.net/Navtex_Archive/${dateString}`);
    await searceFile();
  }
  await downloadMessages();
  writeMessagesInFile();

  await browser.close();
})();

async function searceFile() {
  let links = await page.$$("body > table > tbody > tr > td > a");
  let homelink = links[0];
  links = links.slice(1, links.length);
  try {
    for (let j = 0; j < links.length; j++) {
      let href = await links[j].getProperty("href");
      let hrefValue = await href.jsonValue();
      txtFileLinks.push(hrefValue);
    }
    homelink.click();
    await page.waitForNavigation();
  } catch (e) {
    console.log("errore");
  }
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
