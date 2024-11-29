class CoordinatesExtractor {
  constructor() {
    this.arr = [
      //gestione di questo formato : 11-56.70N 069-48.10W, 22 – 51.24S 014 – 29.52E, 26 – 06.45 S 014 – 57.31 E, 25 55.1S 032 52.5E
      {
        regex:
          /(\d{1,3})(?:\s)?(?:–|-)?(?:\s)?(\d{1,3}(?:\.\d{1,3})?)(?:\s)?([NSEW])\s+(\d{1,3})(?:\s)?(?:–|-)?(?:\s)?(\d{1,3})(?:\.\d{1,3})?(?:\s)?([NSEW])/g,
        callback: (m, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          return `${latDeg} ${latMin} ${latDir}-${lonDeg} ${lonMin} ${lonDir}`;
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
          return `${latDeg} ${latMin}.${latDec} ${latDir}-${lonDeg} ${lonMin}.${lonDec} ${lonDir}`;
        },
      },
      //gestione di questo formato : 05o?=33,59N 052o?=33,45W
      {
        regex:
          /(\d{1,3})o\?=(\d{1,3}(?:,\d{1,3})?)([NSEW])\s(?:–\s+)?(\d{1,3})o\?=(\d{1,3}(?:,\d{1,3})?)([NSEW])/g, //-\s(\d{1,3})o\?
        callback: (match, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          return `${latDeg} ${latMin} ${latDir}-${lonDeg} ${lonMin} ${lonDir}`;
        },
      },
      //gestione di questo formato : 6937N 5651W
      {
        regex: /(\d{1,3})(\d{2})([NSEW])\s+(\d{1,3})(\d{2})([NSEW])/g,
        callback: (match, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          return `${latDeg} ${latMin} ${latDir}-${lonDeg} ${lonMin} ${lonDir}`;
        },
      },
      //gestione di questo formato : 50N12W
      {
        regex: /(\d{1,3})([NSEW])(?:\s+)?(\d{1,3})([NSEW])/g,
        callback: (match, latDeg, latDir, lonDeg, lonDir) => {
          return `${latDeg} 00.00 ${latDir}-${lonDeg} 00.00 ${lonDir}`;
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
          output = output.split("-");
          const latitude = this.#getAngle(output[0]);
          const longitude = this.#getAngle(output[1]);
          coordinatesList.push({ latitude, longitude });
        }

        return coordinatesList;
      }
    }

    return null;
  }

  // il formato di input che si aspetta é : 10 05.08 N
  #getAngle(angleStr) {
    const supp = angleStr.split(" ");
    let direction = supp[2] === "S" || supp[2] === "W" ? -1 : 1;
    const angle =
      direction * (Number(supp[0]) + Number(supp[1].replace(",", ".")) / 60);
    return angle;
  }
}

module.exports = new CoordinatesExtractor();
