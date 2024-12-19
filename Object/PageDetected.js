const cheerio = require("cheerio");
const axios = require("axios");
const Message = require("../Entity/message");

class PageDetected {
  async getMessagesArr(pageUrl) {
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);
    const messages = [];
    const divs = $(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div"
    );

    for (let div of divs) {
      const links = $(div).find("a");

      const publicationDate = links.eq(0).text();
      const type = links.eq(1).text();
      const link = links.eq(2).attr("href");
      const description = links.eq(2).text();
      const text = await this.dawnloadNavtex(link);
      let { navarea, reference } = this.getNavareaAndRif(text);
      if (navarea === null) navarea = this.getNavarea(text);

      messages.push(
        new Message(
          link,
          publicationDate,
          type,
          description,
          text,
          navarea,
          reference,
          false
        )
      );
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

  async getPageNumber2() {
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
    return text;
  }

  getNavareaAndRif(text) {
    let suppList = text.match(
      /\b^(?:\d{1,6}Z (?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) \d{2}\n)?NAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)(?:\nNAVAREA WARNING|\nCOASTAL WARNING (?:E|N|S|I)| WARNING)?(?:\s+(\d{1,5}\/\d{1,4}))\b/
    );
    let navarea = null;
    let reference = null;
    if (suppList !== null) {
      navarea = "NAVAREA " + suppList[1];
      reference = suppList[2];
    }
    return { navarea, reference };
  }

  getNavarea(text) {
    const navareaList = text.match(
      /\b(?:NAVAREA|METAREA) (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21)\b/
    );
    // console.log(navareaList);
    if (navareaList !== null) {
      const number = Number(navareaList[1]);
      return (
        "NAVAREA " +
        (isNaN(number) ? navareaList[1] : this.convertNavare(number))
      );
    }
    return null;
  }

  convertNavare(number) {
    switch (number) {
      case 1:
        return "I";
      case 2:
        return "II";
      case 3:
        return "III";
      case 4:
        return "IV";
      case 5:
        return "V";
      case 6:
        return "VI";
      case 7:
        return "VII";
      case 8:
        return "VIII";
      case 9:
        return "IX";
      case 10:
        return "X";
      case 11:
        return "XI";
      case 12:
        return "XII";
      case 13:
        return "XIII";
      case 14:
        return "XIV";
      case 15:
        return "XV";
      case 16:
        return "XVI";
      case 17:
        return "XVII";
      case 18:
        return "XVIII";
      case 19:
        return "XIX";
      case 20:
        return "XX";
      case 21:
        return "XXI";
    }
  }
}

module.exports = PageDetected;
