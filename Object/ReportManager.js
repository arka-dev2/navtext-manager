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
}

module.exports = new ReportManager();
