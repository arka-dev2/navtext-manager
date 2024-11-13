const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const messages = [];
const txtFileLinks = [];
let page;

(async () => {
  const browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto(
    "https://www.navtex.net/Navtex_Archive/2024%20Jan-Oct/202401%20/"
  );
  await searceFile();
  await downloadMessages();
  writeMessagesInFile();

  await browser.close();
})();

async function searceFile() {
  let links = await page.$$("body > table > tbody > tr > td > a");
  let homelink = links[0];
  links = links.slice(1, links.length);
  for (let j = 0; j < links.length; j++) {
    // if (links[j] === undefined) break;
    let href = await links[j].getProperty("href");
    let hrefValue = await href.jsonValue();
    if (!hrefValue.endsWith(".txt")) {
      hrefValue = hrefValue.substring(0, hrefValue.length - 1);
      let cartella = hrefValue
        .substring(hrefValue.lastIndexOf("/") + 1, hrefValue.length)
        .replaceAll("%20", " ");
      console.log(cartella);
      try {
        links[j].click();
      } catch (e) {
        console.log(e);
        continue;
      }

      await page.waitForNavigation();
      await searceFile();
      links = await page.$$("body > table > tbody > tr > td > a");
      homelink = links[0];
      links = links.slice(1, links.length);
    } else {
      txtFileLinks.push(hrefValue);
    }
  }
  homelink.click();
  await page.waitForNavigation();
}

async function downloadMessages() {
  console.log(txtFileLinks.length);
  for (let hrefValue of txtFileLinks) {
    console.log("download : " + hrefValue);
    const message = await downloadFileToVariable(hrefValue);
    messages.push(message);
  }
  // for (let i = 0; i < 3000; i++) {
  //   console.log("download : " + txtFileLinks[i]);
  //   const message = await downloadFileToVariable(txtFileLinks[i]);
  //   messages.push(message);
  // }
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
