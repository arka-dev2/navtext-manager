const reportsDAO = require("../Dao/ReportsDAO.js");
const Report = require("../Entity/Report");
const dateExtractor = require("./DateExtractor");
const coordinatesExtractor = require("./CoordinatesExtractor");

class ReportManager {
  estractReport(message) {
    let { date, time } = dateExtractor.getDate(message.text);
    let coordinates = coordinatesExtractor.getCoordinate(message.text);

    if (date !== null && coordinates !== null)
      return new Report(message.link, message.type, date, time, coordinates);
    return null;
  }

  insertIntoDB(report) {
    reportsDAO.insertReport(report);
  }

  getReportFromMessage(message) {
    //----    check per constrollare se nel testo ci sono più navtex    ----
    this.clearTextMessage(message);
    const subMessages = this.getMultiNavtexMessages(message.text);

    if (subMessages.length == 1) {
    }

    return {
      messageType: "uncategorized",
      areatype: null,
      coordinates: null,
      navtext: {
        navarea: message.navarea,
        text: message.text,
        description: message.description,
      },
    };
  }

  getAreaType(text) {
    if (text.toUpperCase().includes("IN AREA BOUND BY")) return "polygon";
    if (text.toUpperCase().includes("IN AREAS BOUND BY"))
      return "multi-polygon";
    return "";
  }

  getMultiNavtexMessages(text) {
    const messages = [];
    const navareaList = text.match(
      /\b(?:NAVAREA|METAREA) (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21)(?:\s+(\d{1,5}\/\d{1,4}))?\b/g
      // /\bNAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)(?:\s+(\d{1,5}\/\d{1,4}))?\n\b/g
    );
    for (let i = 0; i < navareaList.length - 1; i++) {
      messages.push(
        text.substring(
          text.indexOf(navareaList[i]),
          text.indexOf(navareaList[i + 1])
        )
      );
    }
    messages.push(
      text.substring(
        text.indexOf(navareaList[navareaList.length - 1]),
        text.length
      )
    );
    return messages;
  }

  //questa funzione elimina testo che potrebbe falsare la lettura del messaggio
  clearTextMessage(message) {
    let navareaList = message.text.match(
      /\bCANCEL NAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)(?:\s+(\d{1,5}\/\d{1,4}))\b/g
    );
    if (navareaList !== null) {
      for (let navarea of navareaList)
        message.text = message.text.replaceAll(navarea, "");
    }
  }
}

module.exports = new ReportManager();
