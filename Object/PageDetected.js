const cheerio = require("cheerio");
const axios = require("axios");

class PageDetected {
  async getNavtexObjArr(pageUrl) {
    const { data: html } = await axios.get(pageUrl);
    const $ = cheerio.load(html);
    const navtexObj = [];
    const divs = $(
      "body > div.wp-site-blocks > div > div:nth-child(2) > div > ul > li > div"
    );

    $(divs).each((index, div) => {
      const links = $(div).find("a");

      const date = links.eq(0).text();
      const type = links.eq(1).text();
      const link = links.eq(2).attr("href");
      navtexObj.push({ date, type, link });
    });

    return navtexObj;
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
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
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
    text = text.replaceAll("\n", " ");
    return text;
  }
}

module.exports = PageDetected;
