const fs = require("fs");
const year = "2024";
const messegesOutput = [];
const discardedMessages = [];
const messages = JSON.parse(
  fs.readFileSync("messages_navtex/message.json").toString()
);
main();

function main() {
  extractMessage();
  printAcceptedMessages();
  printDiscardedMessages();
}

function extractMessage() {
  for (let message of messages) {
    let code = message.match(/\b[A-Z]{2}[0-9]{2}\b/g);
    let date = message.match(/\b[0-9]{6} UTC [A-Z]{3}\b/g);
    // let coordinates = null;
    let coordinates = message.match(
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]/g
    );

    // ----    controllo per i vari tipi di coordinate    ----
    // 57-41.3N -  010-36.4E
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW] -  (\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]/g
    //   );
    //   if (coordinates !== null) {
    //     for (let coordinate of coordinates) {
    //       coordinate = coordinate.replace(" -  ", " ");
    //     }
    //   }
    // }

    // 54-02.6N 004-34.E
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3}\.)[NSEW]/g
    //   );
    // }

    // 71 N 12 E
    // if (coordinates === null) {
    //   coordinates = message.match(/(\d{1,3})\s[NSEW]\s+(\d{1,3})\s[NSEW]/g);
    //   if (coordinates !== null) {
    //     for (let i = 0; i < coordinates.length; i++) {
    //       let supp = coordinates[i].split(" ");
    //       coordinates[i] = `${supp[0]}-0.0${supp[1]} ${supp[2]}-0.0${supp[3]}`;
    //     }
    //   }
    // }

    // 45N 07W
    // if (coordinates === null) {
    //   coordinates = message.match(/(\d{1,3})[NSEW]\s+(\d{1,3})[NSEW]/g);
    //   if (coordinates !== null) {
    //     for (let i = 0; i < coordinates.length; i++) {
    //       let supp = coordinates[i].split(" ");
    //       coordinates[i] =
    //         supp[0].substring(0, supp[0].length - 1) +
    //         "-0.0" +
    //         supp[0].substring(supp[0].length - 1, supp[0].length) +
    //         " " +
    //         supp[1].substring(0, supp[1].length - 1) +
    //         "-0.0" +
    //         supp[1].substring(supp[1].length - 1, supp[1].length);
    //     }
    //   }
    // }

    // 67-07-03.13N 032-24-37.07E
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(\d{1,3})-(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]/g
    //   );
    // }

    // 5530.5N 00526.5E
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(\d{1,5})\.\d{1,3}[NSEW]\s+(\d{1,5})\.\d{1,3}[NSEW]/g
    //   );
    // }

    // 67-05-28.N 032-3 E

    // 51-24.8N 001- 1.9E
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})- (\d{1,3}(?:\.\d{1,3})?)[NSEW]/g
    //   );
    // }

    // 4550N - 00340W
    // if (coordinates === null) {
    //   coordinates = message.match(/(\d{1,5})[NSEW]\s-\s+(\d{1,5})[NSEW]/g);
    // }

    // 53-26.N 002-15.3E
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(\d{1,3})-(\d{1,3}\.[NSEW]\s+(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?))[NSEW]/g
    //   );
    // }

    // 54-01,6N 007-33,0E
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(\d{1,3})-(\d{1,3}(?:\,\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3}(?:\,\d{1,3})?)[NSEW]/g
    //   );
    // }

    // 6726,8 N 01422.8 E
    // 41.3N 010 36.4E
    // 698.3 N 01540. E
    // 6650.6 N 01318.0 E
    // 67-05-28.N 032-3 E
    // 67-5-5.7N 3-3-58.E
    // 47 24,23 N - 005 28,20 W
    // 6650.6 N 01318.0 E
    // 53 41.25N 010 03.46W
    // if (coordinates === null) {
    //   coordinates = message.match(
    //     /(?:(\d{1,3})[-\s]?\d{1,2}(?:[.,]\d+)?\s?[NSEW])\s?(?:-?\s?(\d{1,3})[-\s]?\d{1,2}(?:[.,]\d+)?\s?[NSEW])/g
    //   );
    // }

    //----    codice da rimuovere    ----
    if (date === null) date = "290903 UTC DEC";
    if (code === null || date === null || coordinates === null) {
      //----    messaggi scartati    ----
      discardedMessages.push({ message, code, date, coordinates });
    } else {
      code = code !== null ? code[0] : code;
      date = date !== null ? date[0] : date;
      date += " " + year;
      messegesOutput.push({ message, code, date, coordinates });
    }
  }
}

//----    scrittura nel file dei messaggi buoni    ----
function printAcceptedMessages() {
  let output = "[\n";
  for (let message of messegesOutput)
    output += "\t" + JSON.stringify(message) + ",\n";
  output = output.substring(0, output.length - 2) + "\n]";
  fs.writeFileSync("data_output/acceptedMessages.json", output);
}

//----    scrittura nel file dei messaggi scartati    ----
function printDiscardedMessages() {
  let outDiscDate = "[\n";
  let outDiscCode = "[\n";
  let outDiscCoord = "[\n";

  for (let message of discardedMessages) {
    if (message.code === null)
      outDiscCode += "\t" + JSON.stringify(message) + ",\n";
    else if (message.date === null)
      outDiscDate += "\t" + JSON.stringify(message) + ",\n";
    else if (message.coordinates === null)
      outDiscCoord += "\t" + JSON.stringify(message) + ",\n";
  }
  outDiscCode = outDiscCode.substring(0, outDiscCode.length - 2) + "\n]";
  outDiscDate = outDiscDate.substring(0, outDiscDate.length - 2) + "\n]";
  outDiscCoord = outDiscCoord.substring(0, outDiscCoord.length - 2) + "\n]";

  fs.writeFileSync("data_output/codeDiscardedMessages.json", outDiscCode);
  fs.writeFileSync("data_output/dateDiscardedMessages.json", outDiscDate);
  fs.writeFileSync(
    "data_output/coordinatesDiscardedMessages.json",
    outDiscCoord
  );
}
