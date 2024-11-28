class DateExtractor {
  constructor() {
    this.regex1 =
      /\b\d{6}Z (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) \d{2}\b/g;
    this.regex2 =
      /\b\d{2} (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) \d{2} TO \d{2} (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) \d{2}\b/g;
    this.regex3 =
      /\b\d{6} UTC (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) \d{2}\b/g;
    this.regex4 =
      /\b\d{2} (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) \d{2} from \d{4}UTC to \d{4}UTC\b/g;
  }

  getDate(string) {
    let dateExtract = string.match(this.regex1);
    if (dateExtract !== null) return this.getDateFormat1(dateExtract[0]);

    dateExtract = string.match(this.regex2);
    if (dateExtract !== null) return this.getDateFormat2(dateExtract[0]);

    dateExtract = string.match(this.regex3);
    if (dateExtract !== null) return this.getDateFormat3(dateExtract[0]);

    dateExtract = string.match(this.regex4);
    if (dateExtract !== null) return this.getDateFormat4(dateExtract[0]);

    dateExtract = string.match(this.regex5);
    if (dateExtract !== null) return this.getDateFormat5(dateExtract[0]);

    return { date: null, time: null };
  }

  //gestione di questo formato : 062323Z SEP 24
  getDateFormat1(dateString) {
    let day = dateString.substring(0, 2);
    let hour = Number(dateString.substring(2, 4));
    let minute = Number(dateString.substring(4, 6));
    let month = this.#getMonth1(dateString.substring(8, 11));
    let year = `20${dateString.substring(12, 14)}`;

    const desc = hour > 12 ? "PM" : "AM";
    hour = hour > 12 ? `${hour - 12}` : hour;
    hour = hour < 10 ? `0${hour}` : hour;
    minute = minute < 10 ? `0${minute}` : minute;

    return {
      date: `${day}/${month}/${year}`,
      time: `${hour}:${minute} ${desc}`,
    };
  }

  //gestione di questo formato : 17 NOV 24 TO 02 DEC 24
  getDateFormat2(dateString) {
    dateString = dateString.split(" TO ")[0];
    let day = dateString.substring(0, 2);
    let month = this.#getMonth1(dateString.substring(3, 6));
    let year = `20${dateString.substring(7, 9)}`;
    return {
      date: `${day}/${month}/${year}`,
      time: "00:00 AM",
    };
  }

  //gestione di questo formato : 192030 UTC APR 25
  getDateFormat3(dateString) {
    let day = dateString.substring(0, 2);
    let hour = Number(dateString.substring(2, 4));
    let minute = Number(dateString.substring(4, 6));
    let month = this.#getMonth1(dateString.substring(11, 14));
    let year = `20${dateString.substring(15, 17)}`;

    const desc = hour > 12 ? "PM" : "AM";
    hour = hour > 12 ? `${hour - 12}` : hour;
    hour = hour < 10 ? `0${hour}` : hour;
    minute = minute < 10 ? `0${minute}` : minute;

    return {
      date: `${day}/${month}/${year}`,
      time: `${hour}:${minute} ${desc}`,
    };
  }

  //gestione di questo formato : 31 OCT 24 from 0300UTC to 1600UTC
  getDateFormat4(dateString) {
    let day = dateString.substring(0, 2);
    let hour = Number(dateString.substring(15, 17));
    let minute = Number(dateString.substring(17, 19));
    let month = this.#getMonth1(dateString.substring(3, 6));
    let year = `20${dateString.substring(7, 9)}`;

    const desc = hour > 12 ? "PM" : "AM";
    hour = hour > 12 ? `${hour - 12}` : hour;
    hour = hour < 10 ? `0${hour}` : hour;
    minute = minute < 10 ? `0${minute}` : minute;

    return {
      date: `${day}/${month}/${year}`,
      time: `${hour}:${minute} ${desc}`,
    };
  }

  //gestione di questo formato : 05 SEPTEMBER 24 from 1100UTC to 2300UTC
  getDateFormat5(dateString) {
    let output = dateString.replace(
      this.regex5,
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

  #getMonth1(stringMonth) {
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
