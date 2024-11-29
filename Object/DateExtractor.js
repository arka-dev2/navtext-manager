class DateExtractor {
  constructor() {
    this.arr = [
      //gestione di questo formato : 062323Z SEP 24
      {
        regex:
          /\b(\d{2})(\d{2})(\d{2})Z (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2})\b/g,
        callback: (m, day, hour, minute, month, year) => {
          hour = Number(hour);
          minute = Number(minute);

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${day}/${this.#getMonth1(month)}/20${year}`;
          const time = `${hour}:${minute} ${desc}`;
          return `${date}-${time}`;
        },
      },
      //gestione di questo formato : 17 NOV 24 TO 02 DEC 24
      {
        regex:
          /\b(\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2}) TO (\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2})\b/g,
        callback: (m, dayFrom, monthFrom, yearFrom, dayTo, monthTo, yearTo) => {
          const date = `${dayFrom}/${this.#getMonth1(monthFrom)}/20${yearFrom}`;
          const time = `00:00 AM`;
          return `${date}-${time}`;
        },
      },
      //gestione di questo formato : 192030 UTC APR 25, 111245 UTC MAR 2024
      {
        regex:
          /\b(\d{2})(\d{2})(\d{2}) UTC (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2}|\d{4})\b/g, //
        callback: (m, day, hour, minute, month, year) => {
          hour = Number(hour);
          minute = Number(minute);

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;
          year = year.length === 4 ? year : `20${year}`;

          const date = `${day}/${this.#getMonth1(month)}/${year}`;
          const time = `${hour}:${minute} ${desc}`;
          return `${date}-${time}`;
        },
      },
      //gestione di questo formato : 31 OCT 24 from 0300UTC to 1600UTC
      {
        regex:
          /\b(\d{1,2}) (JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC) (\d{2}) from (\d{4})UTC to (\d{4})UTC\b/g,
        callback: (m, day, month, year, from, to) => {
          let hour = Number(from.substring(0, 2));
          let minute = Number(from.substring(2, 4));

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${day}/${this.#getMonth1(month)}/20${year}`;
          const time = `${hour}:${minute} ${desc}`;
          return `${date}-${time}`;
        },
      },
      //gestione di questo formato : 05 SEPTEMBER 24 from 1100UTC to 2300UTC
      {
        regex:
          /\b(\d{1,2}) (JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER) (\d{2}) from (\d{4})UTC to (\d{4})UTC\b/g,
        callback: (m, day, month, year, from, to) => {
          let hour = Number(from.substring(0, 2));
          let minute = Number(from.substring(2, 4));

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${day}/${this.#getMonth2(month)}/20${year}`;
          const time = `${hour}:${minute} ${desc}`;
          return `${date}-${time}`;
        },
      },
      //gestione di questo formato : 21 Nov 2024 TIME: 0242 UTC
      {
        regex:
          /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s+(?:TIME|time):\s+(\d{4})\s+UTC/g,
        callback: (m, day, month, year, time) => {
          let hour = Number(time.substring(0, 2));
          let minute = Number(time.substring(2, 4));

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${day}/${this.#getMonth1(month)}/${year}`;
          const timeSupp = `${hour}:${minute} ${desc}`;
          return `${date}-${timeSupp}`;
        },
      },
      //gestione di questo formato : 0300 UTC 21 NOVEMBER 2024
      {
        regex:
          /\b(\d{1,2})(\d{1,2})\s+UTC\s+(\d{1,2})\s+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{4})/g,
        callback: (m, hour, minute, day, month, year) => {
          hour = Number(hour);
          minute = Number(minute);

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${day}/${this.#getMonth2(month)}/${year}`;
          const timeSupp = `${hour}:${minute} ${desc}`;
          return `${date}-${timeSupp}`;
        },
      },
      //gestione di questo formato : 2024/11/05 from 1100UTC to 2300UTC
      {
        regex:
          /\b(\d{1,4})\/(\d{1,2})\/(\d{1,2})\s+from\s+(\d{1,4})UTC\s+to\s+(\d{4})UTC/g,
        callback: (m, year, month, day, from, to) => {
          let hour = Number(from.substring(0, 2));
          let minute = Number(from.substring(2, 4));

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${day}/${month}/${year}`;
          const timeSupp = `${hour}:${minute} ${desc}`;
          return `${date}-${timeSupp}`;
        },
      },
      //gestione di questo formato : 141405 UTC MAR 24
      {
        regex:
          /\b(\d{2})(\d{2})(\d{2})\s+UTC\s+(\d{2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/g,
        callback: (m, day, hour, minute, year, month) => {
          hour = Number(hour);
          minute = Number(minute);

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${day}/${(this, this.#getMonth1(month))}/20${year}`;
          const timeSupp = `${hour}:${minute} ${desc}`;
          return `${date}-${timeSupp}`;
        },
      },
      //gestione di questo formato : 0145 UTC AND 0430 UTC FROM 23 NOV 2024 TO 06 DEC 2024
      {
        regex:
          /\b(\d{4})\s+UTC\s+AND\s+(\d{4})\s+UTC\s+FROM\s+(\d{2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})\s+TO\s+(\d{2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})\b/g, //
        callback: (
          m,
          from,
          to,
          dayFrom,
          monthFrom,
          yearFrom,
          dayTo,
          monthTo,
          yearTo
        ) => {
          let hour = Number(from.substring(0, 2));
          let minute = Number(from.substring(2, 4));

          const desc = hour > 12 ? "PM" : "AM";
          hour = hour > 12 ? `${hour - 12}` : hour;
          hour = hour < 10 ? `0${hour}` : hour;
          minute = minute < 10 ? `0${minute}` : minute;

          const date = `${dayFrom}/${
            (this, this.#getMonth1(monthFrom))
          }/20${yearFrom}`;
          const timeSupp = `${hour}:${minute} ${desc}`;
          return `${date}-${timeSupp}`;
        },
      },
    ];
  }

  getDate(string) {
    for (let obj of this.arr) {
      let dateExtract = string.match(obj.regex);
      if (dateExtract !== null) {
        const dateString = dateExtract[0];
        let output = dateString.replace(obj.regex, obj.callback);
        output = output.split("-");
        return { date: output[0], time: output[1] };
      }
    }
    return { date: null, time: null };
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
