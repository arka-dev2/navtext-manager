class DateExtractor {
  constructor() {
    this.regexs = [
      /\b(\d{2})(\d{2})(\d{2})Z (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2})\b/g,
      /\b(\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2}) TO (\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2})\b/g,
      /\b(\d{2})(\d{2})(\d{2}) UTC (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2})\b/g,
      /\b(\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2}) from (\d{4})UTC to (\d{4})UTC\b/g,
      /\b(\d{1,2}) (JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER) (\d{2}) from (\d{4})UTC to (\d{4})UTC\b/g,
      /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s+(?:TIME|time):\s+(\d{4})\s+UTC/g,
    ];
  }

  getDate(string) {
    let count = 1;
    for (let regex of this.regexs) {
      let dateExtract = string.match(regex);
      if (dateExtract !== null)
        return this["getDateFormat" + count](dateExtract[0]);
      count++;
    }
    return { date: null, time: null };
  }

  //gestione di questo formato : 062323Z SEP 24
  getDateFormat1(dateString) {
    let output = dateString.replace(
      this.regexs[0],
      (match, day, hour, minute, month, year) => {
        hour = Number(hour);
        minute = Number(minute);

        const desc = hour > 12 ? "PM" : "AM";
        hour = hour > 12 ? `${hour - 12}` : hour;
        hour = hour < 10 ? `0${hour}` : hour;
        minute = minute < 10 ? `0${minute}` : minute;

        const date = `${day}/${this.#getMonth1(month)}/20${year}`;
        const time = `${hour}:${minute} ${desc}`;
        return `${date}-${time}`;
      }
    );
    output = output.split("-");
    return { date: output[0], time: output[1] };
  }

  //gestione di questo formato : 17 NOV 24 TO 02 DEC 24
  getDateFormat2(dateString) {
    let output = dateString.replace(
      this.regexs[1],
      (match, dayFrom, monthFrom, yearFrom, dayTo, monthTo, yearTo) => {
        const date = `${dayFrom}/${this.#getMonth1(monthFrom)}/20${yearFrom}`;
        const time = `00:00 AM`;
        return `${date}-${time}`;
      }
    );
    output = output.split("-");
    return { date: output[0], time: output[1] };
  }

  //gestione di questo formato : 192030 UTC APR 25
  getDateFormat3(dateString) {
    let output = dateString.replace(
      this.regexs[2],
      (match, day, hour, minute, month, year) => {
        hour = Number(hour);
        minute = Number(minute);

        const desc = hour > 12 ? "PM" : "AM";
        hour = hour > 12 ? `${hour - 12}` : hour;
        hour = hour < 10 ? `0${hour}` : hour;
        minute = minute < 10 ? `0${minute}` : minute;

        const date = `${day}/${this.#getMonth1(month)}/20${year}`;
        const time = `${hour}:${minute} ${desc}`;
        return `${date}-${time}`;
      }
    );
    output = output.split("-");
    return { date: output[0], time: output[1] };
  }

  //gestione di questo formato : 31 OCT 24 from 0300UTC to 1600UTC
  getDateFormat4(dateString) {
    let output = dateString.replace(
      this.regexs[3],
      (match, day, month, year, from, to) => {
        let hour = Number(from.substring(0, 2));
        let minute = Number(from.substring(2, 4));

        const desc = hour > 12 ? "PM" : "AM";
        hour = hour > 12 ? `${hour - 12}` : hour;
        hour = hour < 10 ? `0${hour}` : hour;
        minute = minute < 10 ? `0${minute}` : minute;

        const date = `${day}/${this.#getMonth1(month)}/20${year}`;
        const time = `${hour}:${minute} ${desc}`;
        return `${date}-${time}`;
      }
    );
    output = output.split("-");
    return { date: output[0], time: output[1] };
  }

  //gestione di questo formato : 05 SEPTEMBER 24 from 1100UTC to 2300UTC
  getDateFormat5(dateString) {
    let output = dateString.replace(
      this.regexs[4],
      (match, day, month, year, from, to) => {
        let hour = Number(from.substring(0, 2));
        let minute = Number(from.substring(2, 4));

        const desc = hour > 12 ? "PM" : "AM";
        hour = hour > 12 ? `${hour - 12}` : hour;
        hour = hour < 10 ? `0${hour}` : hour;
        minute = minute < 10 ? `0${minute}` : minute;

        const date = `${day}/${this.#getMonth2(month)}/20${year}`;
        const time = `${hour}:${minute} ${desc}`;
        return `${date}-${time}`;
      }
    );
    output = output.split("-");
    return { date: output[0], time: output[1] };
  }

  //gestione di questo formato : 21 Nov 2024 TIME: 0242 UTC
  getDateFormat6(dateString) {
    console.log(dateString);
    let output = dateString.replace(
      this.regexs[5],
      (match, day, month, year, time) => {
        console.log(time);
        let hour = Number(time.substring(0, 2));
        let minute = Number(time.substring(2, 4));

        const desc = hour > 12 ? "PM" : "AM";
        hour = hour > 12 ? `${hour - 12}` : hour;
        hour = hour < 10 ? `0${hour}` : hour;
        minute = minute < 10 ? `0${minute}` : minute;

        const date = `${day}/${this.#getMonth1(month)}/${year}`;
        const timeSupp = `${hour}:${minute} ${desc}`;
        return `${date}-${timeSupp}`;
      }
    );
    output = output.split("-");
    return { date: output[0], time: output[1] };
  }

  #getMonth1(stringMonth) {
    switch (stringMonth.toUpperCase()) {
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

  #getMonth2(stringMonth) {
    switch (stringMonth) {
      case "JANUARY":
        return "01";
      case "FEBRUARY":
        return "02";
      case "MARCH":
        return "03";
      case "APRIL":
        return "04";
      case "MAY":
        return "05";
      case "JUNE":
        return "06";
      case "JULY":
        return "07";
      case "AUGUST":
        return "08";
      case "SEPTEMBER":
        return "09";
      case "OCTOBER":
        return "10";
      case "NOVEMBER":
        return "11";
      case "DECEMBER":
        return "12";
      default:
        return "";
    }
  }
}

module.exports = new DateExtractor();
