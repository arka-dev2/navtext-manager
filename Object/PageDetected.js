const cheerio = require("cheerio");
const axios = require("axios");

class PageDetected {
  async getMessagesArr(pageUrl) {
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);
    const messages = [];
    const divs = $(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div"
    );

    $(divs).each((index, div) => {
      const links = $(div).find("a");

      const publicationDate = links.eq(0).text();
      const type = links.eq(1).text();
      const link = links.eq(2).attr("href");

      messages.push({ publicationDate, type, link });
    });

    //----    Download dei messaggi    ----
    for (let message of messages) {
      message.text = await this.dawnloadNavtex(message.link);
      message.navarea = this.getNavarea(message.text);
    }

    return messages;
  }

  async getPageNumber() {
    const { data: html } = await axios.get(`https://marinesafety.net/`);
    const $ = cheerio.load(html);
    const element = $(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > nav > div > a:nth-child(5)"
    );
    const innerHTML = element.text();
    const pageNumber = Number(innerHTML.replaceAll(",", ""));
    return pageNumber;
  }

  async getPageNumber2(linkDB) {
    const date = new Date();
    const year = date.getFullYear();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    day = day < 10 ? `0${day}` : `${day}`;
    month = month < 10 ? `0${month}` : `${month}`;
    const todayStringDate = `${year}-${month}-${day}`;

    let numPage;
    for (numPage = 1; true; numPage++) {
      const link = `https://marinesafety.net/?query-52-page=${numPage}`;
      const dates = await this.#getDateArr(link);
      if (dates.includes(todayStringDate)) continue;
      else break;
    }
    return numPage - 1;
  }

  async #getDateArr(pageUrl) {
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);
    const dates = [];
    const divs = $(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div > div:nth-child(1)"
    );

    $(divs).each((index, div) => {
      const links = $(div).find("a");
      dates.push(links.eq(0).text());
    });

    return dates;
  }

  async dawnloadNavtex(link) {
    const { data: html } = await axios.get(link);
    const $ = cheerio.load(html);
    let text = $(
      "div.entry-content.alignfull.wp-block-post-content.is-layout-constrained.wp-block-post-content-is-layout-constrained"
    ).text();
    // text = text.replaceAll("\n", " ");
    return text;
  }

  getNavarea(text) {
    let navarea = "";
    const navareaList = text.match(
      /\bNAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)\b/g
    );
    if (navareaList !== null) navarea = navareaList[0];
    return navarea;
  }
}

module.exports = PageDetected;
