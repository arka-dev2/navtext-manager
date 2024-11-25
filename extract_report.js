const messageDAO = require("./Dao/MessageDAO.js");
const reportsDAO = require("./Dao/ReportsDAO.js");
const Report = require("./Entity/Report");
const utility = require("./Object/Utility.js");
const conn = require("./Object/conn.js");
let messages = messageDAO.getAllMessage();
const year = new Date().getFullYear();
const messegesOutput = [];

(() => {
  extractMessage();
})();

function extractMessage() {
  for (let message of messages) {
    let date = message.text.match(/\b[0-9]{6}Z [A-Z]{3} [0-9]{2}\b/g);
    let coordinates = message.text.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]/g
    );

    if ((date !== null) & (coordinates !== null)) {
      const coordinatesList = [];
      date = utility.getDate(date[0]);

      for (let coordinate of coordinates) {
        coordinatesList.push(utility.getCoordinates(coordinate));
      }

      const report = new Report(
        0,
        message.link,
        message.type,
        date,
        coordinatesList
      );
      reportsDAO.insertReport(report);
    }
  }
}
