//lo script scarica i navtex solo di oggi
const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const messages = [];
const linkNavTex = new Set();
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
  // const pageNumber = await getPageNumber();
  const pageNumber = 3;
  for (let i = 1; i <= pageNumber; i++) {
    console.log("pagina numero : " + i);
    await page.goto(`https://marinesafety.net/?query-52-page=${i}`);
    let links = await page.$$(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div > div:nth-child(3) > h4 > a"
    );
    for (let link of links) {
      let href = await link.getProperty("href");
      let hrefValue = await href.jsonValue();
      linkNavTex.add(hrefValue);
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
  let count = 0;
  for (let hrefValue of linkNavTex) {
    console.log(count++);
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
