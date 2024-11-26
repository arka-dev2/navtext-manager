const reportsDAO = require("../Dao/ReportsDAO.js");
const Report = require("../Entity/Report");

class ReportManager {
  estractReport(text) {
    const report = {};
    let date = text.match(/\b[0-9]{6}Z [A-Z]{3} [0-9]{2}\b/g);
    let coordinates = text.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]/g
    );

    if ((date !== null) & (coordinates !== null)) {
      const coordinatesList = [];
      date = this.getDate(date[0]);

      for (let coordinate of coordinates) {
        coordinatesList.push(this.getCoordinates(coordinate));
      }

      report = new Report(message.link, message.type, date, coordinatesList);
    }
  }

  getDate(dateString) {
    let day = dateString.substring(0, 2);
    let hour = Number(dateString.substring(2, 4));
    let minute = Number(dateString.substring(4, 6));
    let month = this.#getMonth(dateString.substring(8, 11));
    let year = `20${dateString.substring(12, 14)}`;

    const desc = hour > 12 ? "PM" : "AM";
    hour = hour > 12 ? `${hour - 12}` : hour;
    hour = hour < 10 ? `0${hour}` : hour;
    minute = minute < 10 ? `0${minute}` : minute;

    return `${day}/${month}/${year}-${hour}:${minute} ${desc}`;
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

  #getMonth(stringMonth) {
    switch (stringMonth) {
      case "JAN":
        return "01";
      case "FEB":
        return "02";
      case "MAR":
        return "03";
      case "APR":
        return "04";
      case "MAY":
        return "05";
      case "JUN":
        return "06";
      case "JUL":
        return "07";
      case "AUG":
        return "08";
      case "SEP":
        return "09";
      case "OCT":
        return "10";
      case "NOV":
        return "11";
      case "DEC":
        return "12";
      default:
        return "";
    }
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
