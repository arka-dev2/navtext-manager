class CoordinatesExtractor {
  constructor() {
    this.regexs = [
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)([NSEW])\s+(\d{1,3})-(\d{1,3})(?:\.\d{1,3})?([NSEW])/g,
      /(\d{1,3})o\?=(\d{1,3})’(\d{1,3})\?([NSEW])\s*,\s*(\d{1,3})o\?=(\d{1,3})’(\d{1,3})\?([NSEW])/g,
    ];
  }

  getCoordinate(string) {
    let count = 1;
    for (let regex of this.regexs) {
      let coordinateExtract = string.match(regex);
      if (coordinateExtract !== null)
        return this["getCoordinateFormat" + count](coordinateExtract);
      count++;
    }
    return null;
  }

  //gestione di questo formato : 05-27.24N 052-40.00W
  getCoordinateFormat1(coordinateExtract) {
    const coordinatesList = [];

    for (let coordinate of coordinateExtract) {
      let latitude, longitude;
      coordinate.replace(
        this.regexs[0],
        (match, latDeg, latMin, latDir, lonDeg, lonMin, lonDir) => {
          latitude = this.#getAngle(`${latDeg} ${latMin} ${latDir}`);
          longitude = this.#getAngle(`${lonDeg} ${lonMin} ${lonDir}`);
        }
      );
      coordinatesList.push({ latitude, longitude });
    }

    return coordinatesList;
  }

  //gestione di questo formato : 05o?=27’24?N , 052o?=40’00?W
  getCoordinateFormat2(coordinateExtract) {
    const coordinatesList = [];

    for (let coordinate of coordinateExtract) {
      let output = coordinate.replace(
        this.regexs[1],
        (
          match,
          latDeg,
          latMin,
          latDec,
          latDir,
          lonDeg,
          lonMin,
          lonDec,
          lonDir
        ) => {
          let lat = `${latDeg}-${latMin}.${latDec.padStart(2, "0")}${latDir}`;
          let long = `${lonDeg}-${lonMin}.${lonDec.padStart(2, "0")}${lonDir}`;
          return `${lat} ${long}`;
        }
      );
      output = output.split(" ");
      coordinatesList.push({
        latitude: this.#getAngle(output[0]),
        longitude: this.#getAngle(output[1]),
      });
    }
    return coordinatesList;
  }

  // il formato di input che si aspetta é : 10-05.08N
  #getAngle(angleStr) {
    const supp = angleStr.split(" ");
    let direction = supp[2] === "S" || supp[2] === "W" ? -1 : 1;
    const angle = direction * (Number(supp[0]) + Number(supp[1]) / 60);
    return angle;
  }
}

module.exports = new CoordinatesExtractor();
