const reportsDAO = require("../Dao/ReportsDAO.js");
const Report = require("../Entity/Report");
const dateExtractor = require("./DateExtractor");

class ReportManager {
  estractReport(message) {
    let report = null;
    let { date, time } = dateExtractor.getDate(message.text);
    let coordinates = message.text.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]/g
    );

    if ((date !== null) & (coordinates !== null)) {
      const coordinatesList = [];

      for (let coordinate of coordinates) {
        coordinatesList.push(this.getCoordinates(coordinate));
      }

      report = new Report(
        message.link,
        message.type,
        date,
        time,
        coordinatesList
      );
    }
    return report;
  }
  getCoordinates(coordinate) {
    let stringLatitude = coordinate.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NS]/g
    );
    let stringLongitude = coordinate.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[EW]/g
    );
    if (stringLatitude === null || stringLongitude === null) return null;
    stringLatitude = stringLatitude[0];
    stringLongitude = stringLongitude[0];
    const latitude = this.#getAngle(stringLatitude);
    const longitude = this.#getAngle(stringLongitude);
    return { latitude, longitude };
  }

  #getAngle(angleStr) {
    let direction = 1;
    const supp = angleStr.substring(0, angleStr.length - 1).split("-");
    const directionStr = angleStr.substring(
      angleStr.length - 1,
      angleStr.length
    );
    if (directionStr === "S" || directionStr === "W") direction = -1;
    const angle = Number(supp[0]) + Number(supp[1]) / 60;
    return direction * angle;
  }

  insertIntoDB(report) {
    reportsDAO.insertReport(report);
  }
}

module.exports = new ReportManager();
