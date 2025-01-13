const dateExtractor = require("../Utiles/DateExtractor");
const coordinatesExtractor = require("../Utiles/CoordinatesExtractor");

class ReportManager {
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
        text: message.text.replaceAll("\n", "<br>"),
        description: message.description,
      },
    };
  }

  getAreaTypeAndCoordinates(text) {
    let coordinates = null;
    let areaType = null;
    let boolCoord = coordinatesExtractor.checkCoordinateExist(text);
    if (boolCoord) {
      if (
        text.toUpperCase().includes("IN AREA BOUND BY") ||
        text.toUpperCase().includes("AREA BOUNDED BY") //
      ) {
        areaType = "polygon";
        coordinates = coordinatesExtractor.getCoordinate(text);
      } else if (text.toUpperCase().includes("IN AREAS BOUND BY")) {
        areaType = "multi-polygon";
        const areas = text.match(/\b([A-Z]\.)\s*([\d-]+\.\d+[NS]\s*[\d-]+\.\d+[EW])\b/g);
        coordinates = [];
        for (let area of areas) {
          coordinates.push(coordinatesExtractor.getCoordinate(area));
        }
      } else if (
        text.toUpperCase().includes("BETWEEN") ||
        text.toUpperCase().includes("ALONG TRACKLINE JOINING")
      ) {
        areaType = "linear";
        coordinates = coordinatesExtractor.getCoordinate(text);
      } else {
        const matchCircle = text.match(/WITHIN (\d+(?:\.\d+)) MILES?/);
        if (matchCircle !== null) {
          // 500 METER EXCURSION ZONE
          areaType = "circle";
          coordinates = coordinatesExtractor.getCoordinate(text);
          coordinates[0].radius = Number(matchCircle[1].replace(",", ".")) * 1852;
        } else {
          areaType = "punctual";
          coordinates = coordinatesExtractor.getCoordinate(text);
        }
      }
    }

    return { areaType, coordinates };
  }

  getMultiNavtexMessages(text) {
    const messages = [];
    const navareaList = text.match(
      /\bNAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)(?:\s+(\d{1,5}\/\d{1,4}))?\b/g
    );
    if (navareaList !== null) {
      for (let i = 0; i < navareaList.length - 1; i++) {
        messages.push(
          text.substring(text.indexOf(navareaList[i]), text.indexOf(navareaList[i + 1]))
        );
      }
      messages.push(text.substring(text.indexOf(navareaList[navareaList.length - 1]), text.length));
    } else messages.push(text);

    return messages;
  }

  clearTextMessage(message) {
    //questa parte modifica il testo che potrebbe falsare la lettura del messaggio
    let navareaList = message.text.match(
      /\bCANCEL NAVAREA (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)(?:\s+(\d{1,5}\/\d{1,4}))?\b/g
    );
    if (navareaList !== null) {
      for (let navarea of navareaList) message.text = message.text.replaceAll(navarea, "");
    }

    //qui cambio il formato delle coordinate
    message.text = coordinatesExtractor.replaceCoordinate(message.text);
  }

  getReport(message) {
    let { areaType, coordinates } = this.getAreaTypeAndCoordinates(message.text);
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
        text: message.text.replaceAll("\n", "<br>"),
        description: message.description,
      },
    };
  }
}

module.exports = new ReportManager();
