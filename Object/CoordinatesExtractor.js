class CoordinatesExtractor {
  constructor() {
    this.arr = [
      //gestione di questo formato : 11-56.70N 069-48.10W, 22 – 51.24S 014 – 29.52E, 26 – 06.45 S 014 – 57.31 E, 25 55.1S 032 52.5E
      {
        regex:
          /(\d{1,3})(?:\s)?(?:–|-)?(?:\s)?(\d{1,3}(?:\.\d{1,3})?)(?:\s)?([NSEW])\s+(\d{1,3})(?:\s)?(?:–|-)?(?:\s)?(\d{1,3}(?:\.\d{1,3})?)(?:\s)?([NSEW])/g,
        callback: (m, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          return `${latDeg}-${latMin}${latDir} ${lonDeg}-${lonMin}${lonDir}`;
        },
      },
      //gestione di questo formato : 05o?=27’24?N , 052o?=40’00?W
      {
        regex:
          /(\d{1,3})o\?=(\d{1,3})’(\d{1,3})\?([NSEW])\s*,\s*(\d{1,3})o\?=(\d{1,3})’(\d{1,3})\?([NSEW])/g,
        callback: (
          m,
          latDeg,
          latMin,
          latDec,
          latDir,
          lonDeg,
          lonMin,
          lonDec,
          lonDir
        ) => {
          return `${latDeg}-${latMin}.${latDec}${latDir} ${lonDeg}-${lonMin}.${lonDec}${lonDir}`;
        },
      },
      //gestione di questo formato : 05o?=33,59N 052o?=33,45W
      {
        regex:
          /(\d{1,3})o\?=(\d{1,3}(?:,\d{1,3})?)([NSEW])\s(?:–\s+)?(\d{1,3})o\?=(\d{1,3}(?:,\d{1,3})?)([NSEW])/g, //-\s(\d{1,3})o\?
        callback: (match, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          return `${latDeg}-${latMin}${latDir} ${lonDeg}-${lonMin}${lonDir}`;
        },
      },
      //gestione di questo formato : 6937N 5651W
      {
        regex: /(\d{1,3})(\d{2})([NSEW])\s+(\d{1,3})(\d{2})([NSEW])/g,
        callback: (match, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          return `${latDeg}-${latMin}${latDir} ${lonDeg}-${lonMin}${lonDir}`;
        },
      },
      //gestione di questo formato : 50N12W
      {
        regex: /(\d{1,3})([NSEW])(?:\s+)?(\d{1,3})([NSEW])/g,
        callback: (match, latDeg, latDir, lonDeg, lonDir) => {
          return `${latDeg}-00.00${latDir} ${lonDeg}-00.00${lonDir}`;
        },
      },
      //gestione di questo formato : LAT. 33 02 N / LONG. 014 52
      {
        regex:
          /LAT. (\d{1,3}) (\d{1,3}(?:\.\d{1,3})?) ([NSEW]) \/ LONG. (\d{1,3}) (\d{1,3}(?:\.\d{1,3})?) ([NSEW])/g,
        callback: (match, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          return `${latDeg}-${latMin}${latDir} ${lonDeg}-${lonMin}${lonDir}`;
        },
      },
    ];
  }

  getCoordinate(string) {
    for (let obj of this.arr) {
      let coordinateExtract = string.match(obj.regex);
      if (coordinateExtract !== null) {
        const coordinatesList = [];

        for (let coordinate of coordinateExtract) {
          let output = coordinate.replace(obj.regex, obj.callback);
          output = output.split(" ");
          const lat = this.#getAngle(output[0]);
          const long = this.#getAngle(output[1]);
          coordinatesList.push({ lat, long });
        }

        return coordinatesList;
      }
    }

    return null;
  }

  // il formato di input che si aspetta é : 10-05.08N
  #getAngle(angleStr) {
    const supp = angleStr.split("-");
    const latDeg = supp[0];
    const latMin = supp[1].substring(0, supp[1].length - 1);
    const directionStr = supp[1].substring(supp[1].length - 1, supp[1].length);
    let direction = directionStr === "S" || directionStr === "W" ? -1 : 1;
    const angle =
      direction * (Number(latDeg) + Number(latMin.replace(",", ".")) / 60);
    return angle;
  }

  replaceCoordinate(text) {
    //scrivo le coordinate nel formato standard, controllando di che formato sono
    for (let obj of this.arr) {
      let coordinateExtract = text.match(obj.regex);
      if (coordinateExtract !== null) {
        text = text.replace(obj.regex, obj.callback);
        break;
      }
    }

    return text;
  }

  checkCoordinateExist(text) {
    for (let obj of this.arr) {
      let coordinateExtract = text.match(obj.regex);
      if (coordinateExtract !== null) return true;
    }

    return false;
  }
}

module.exports = new CoordinatesExtractor();
