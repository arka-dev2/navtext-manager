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
    if (dateExtract !== null) return this.getDateFormat1(dateExtract);

    dateExtract = string.match(this.regex2);
    if (dateExtract !== null) return this.getDateFormat2(dateExtract);

    dateExtract = string.match(this.regex3);
    if (dateExtract !== null) return this.getDateFormat3(dateExtract);

    dateExtract = string.match(this.regex4);
    if (dateExtract !== null) return this.getDateFormat4(dateExtract);

    return { date: null, time: null };
  }

  //gestione di questo formato : 062323Z SEP 24
  getDateFormat1(dateExtract) {
    const dateString = dateExtract[0];
    let day = dateString.substring(0, 2);
    let hour = Number(dateString.substring(2, 4));
    let minute = Number(dateString.substring(4, 6));
    let month = this.#getMonth(dateString.substring(8, 11));
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
  getDateFormat2(dateExtract) {
    let dateString = dateExtract[0].split(" TO ")[0];
    let day = dateString.substring(0, 2);
    let month = this.#getMonth(dateString.substring(3, 6));
    let year = `20${dateString.substring(7, 9)}`;
    return {
      date: `${day}/${month}/${year}`,
      time: "00:00 AM",
    };
  }

  //gestione di questo formato : 192030 UTC APR 25
  getDateFormat3(dateExtract) {
    const dateString = dateExtract[0];
    let day = dateString.substring(0, 2);
    let hour = Number(dateString.substring(2, 4));
    let minute = Number(dateString.substring(4, 6));
    let month = this.#getMonth(dateString.substring(11, 14));
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
  getDateFormat4(dateExtract) {
    const dateString = dateExtract[0];
    let day = dateString.substring(0, 2);
    let hour = Number(dateString.substring(15, 17));
    let minute = Number(dateString.substring(17, 19));
    let month = this.#getMonth(dateString.substring(3, 6));
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
}

module.exports = new DateExtractor();
