const fs = require("fs");

const data = fs.readFileSync("data_output/acceptedMessages.json");
const messages = JSON.parse(data);
const reports = [];

let count = 0;
for (let message of messages) {
  //----    estrapolazione della data dal formato navtex    ----
  let day = message.date.substring(0, 2);
  let hour = Number(message.date.substring(2, 4));
  let minute = Number(message.date.substring(4, 6));
  let month = getMonth(message.date.substring(11, 14));
  let year = message.date.substring(15, 19);

  const date = `${day}/${month}/${year}`;
  const time = getTime(hour, minute);
  // const dateObj = new Date(`${year}-${month}-${date}T${hour}:${minute}:00Z`);

  //----    estrapolazione delle coordinate    ----
  const coordinates = [];
  const type = getTypeRandom();
  for (let coordinate of message.coordinates) {
    console.log(coordinate);
    let stringLatitude = coordinate.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NS]/g
    );
    let stringLongitude = coordinate.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[EW]/g
    );
    if (stringLatitude === null || stringLongitude === null) continue;
    stringLatitude = stringLatitude[0];
    stringLongitude = stringLongitude[0];
    const latitude = getAngle(stringLatitude);
    const longitude = getAngle(stringLongitude);
    reports.push({ type, latitude, longitude, date, time });
  }
}
printReports();

function getMonth(stringMonth) {
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
function getAngle(angleStr) {
  let direction = 1;
  const supp = angleStr.substring(0, angleStr.length - 1).split("-");
  const directionStr = angleStr.substring(angleStr.length - 1, angleStr.length);
  if (directionStr === "S" || directionStr === "W") direction = -1;
  const angle = Number(supp[0]) + Number(supp[1]) / 60;
  return direction * angle;
}
function getTypeRandom() {
  const numero = Math.floor(Math.random() * 5) + 1;
  switch (numero) {
    case 1:
      return "pollution";
    case 2:
      return "casualties";
    case 3:
      return "environment risk";
    case 4:
      return "floating objects";
    case 5:
      return "danger";
  }
}
function getTime(hour, minute) {
  const desc = hour > 12 ? "PM" : "AM";
  hour = hour > 12 ? `${hour - 12}` : hour;
  hour = hour < 10 ? `0${hour}` : hour;
  minute = minute < 10 ? `0${minute}` : minute;
  return `${hour}:${minute} ${desc}`;
}
function printReports() {
  let output = "[\n";
  for (let report of reports) output += "\t" + JSON.stringify(report) + ",\n";
  output = output.substring(0, output.length - 2) + "\n]";

  fs.writeFileSync("data_output/reportsFile.json", output);
}
