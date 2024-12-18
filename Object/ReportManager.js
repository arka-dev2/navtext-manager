const reportsDAO = require("../Dao/ReportsDAO.js");
const Report = require("../Entity/Report");
const dateExtractor = require("./DateExtractor");
const coordinatesExtractor = require("./CoordinatesExtractor");

class ReportManager {
  // estractReport(message) {
  //   let { date, time } = dateExtractor.getDate(message.text);
  //   let coordinates = coordinatesExtractor.getCoordinate(message.text);

  //   if (date !== null && coordinates !== null)
  //     return new Report(message.link, message.type, date, time, coordinates);
  //   return null;
  // }

  // insertIntoDB(report) {
  //   reportsDAO.insertReport(report);
  // }

  getReportFromMessage(message) {
    //----    check per constrollare se nel testo ci sono più navtex    ----
    this.clearTextMessage(message);
    const subMessages = this.getMultiNavtexMessages(message.text);

    if (subMessages.length === 1) {
      return this.getReport(message);
    }

    return {
      // link: message.link,
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
    if (
      text.toUpperCase().includes("IN AREA BOUND BY") ||
      text.toUpperCase().includes("ALONG TRACKLINE JOINING")
    )
      return "polygon";
    if (text.toUpperCase().includes("IN AREAS BOUND BY"))
      return "multi-polygon";
    return "";
  }

  getMultiNavtexMessages(text) {
    const messages = [];
    const navareaList = text.match(
      /\bNAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)(?:\s+(\d{1,5}\/\d{1,4}))?\b/g
    );
    if (navareaList !== null) {
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
    } else messages.push(text);

    return messages;
  }

  clearTextMessage(message) {
    //questa parte modifica il testo che potrebbe falsare la lettura del messaggio
    let navareaList = message.text.match(
      /\bCANCEL NAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)(?:\s+(\d{1,5}\/\d{1,4}))?\b/g
    );
    if (navareaList !== null) {
      for (let navarea of navareaList)
        message.text = message.text.replaceAll(navarea, "");
    }

    //qui cambio il formato delle coordinate
    message.text = coordinatesExtractor.replaceCoordinate(message.text);
  }

  getReport(message) {
    let { areaType, coordinates } = this.getAreaTypeAndCoordinates(
      message.text
    );
    let messageType = "uncategorized";

    if (coordinates !== null && areaType !== null) {
      if (
        message.type === "SPACE DEBRIS" ||
        message.type === "ROCKET LAUNCH" ||
        message.type === "SCIENTIFIC RESEARCH" ||
        message.type === "SEISMIC SURVEY" ||
        message.type === "GEOPOLITICAL INSTABILITY" ||
        message.type === "CABLE OPERATIONS" ||
        message.type === "NAVIGATION HAZARD" ||
        message.type === "PIPELINE OPERATIONS" ||
        message.type === "OIL PLATFORMS"
      )
        messageType = "danger";
      if (message.type === "MAP UPDATE" || message.type === "ICEBERGS")
        messageType = "environment risk";
      if (message.type === "COMMERCIAL SHIPPING" || message.type === "MIGRANTS")
        messageType = "casualties";
      if (message.type === "WEATHER") {
        coordinates = null;
        areaType = null;
      }
      // if (message.type === "ICEBERGS" && areaType === "linear") {
      //   messageType = "uncategorized";
      //   coordinates = null;
      //   areaType = null;
      // }
    }

    return {
      // link: message.link,
      messageType,
      areaType,
      coordinates,
      navtext: {
        navarea: message.navarea,
        text: message.text,
        description: message.description,
      },
    };
  }
}

module.exports = new ReportManager();
