class CoordinatesExtractor {
  constructor() {
    this.regex1 =
      /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]\s+(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NSEW]/g;
    this.regex2 =
      /(\d{1,3})o\?=(\d{1,3})’(\d{1,3})\?([NSEW])\s*,\s*(\d{1,3})o\?=(\d{1,3})’(\d{1,3})\?([NSEW])/g;
  }

  getCoordinate(string) {
    let coordinateExtract = string.match(this.regex1);
    if (coordinateExtract !== null)
      return this.getCoordinateFormat1(coordinateExtract);

    coordinateExtract = string.match(this.regex2);
    if (coordinateExtract !== null)
      return this.getCoordinateFormat2(coordinateExtract);

    return null;
  }

  //gestione di questo formato : 05-27.24N 052-40.00W
  getCoordinateFormat1(coordinateExtract) {
    const coordinatesList = [];

    for (let coordinate of coordinateExtract) {
      let stringLatitude = coordinate.match(
        /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[NS]/g
      );
      let stringLongitude = coordinate.match(
        /(\d{1,3})-(\d{1,3}(?:\.\d{1,3})?)[EW]/g
      );
      if (stringLatitude === null || stringLongitude === null) return null;
      stringLatitude = stringLatitude[0];
      stringLongitude = stringLongitude[0];
      const latitude = this.#getAngle(stringLatitude);
      const longitude = this.#getAngle(stringLongitude);
      coordinatesList.push({ latitude, longitude });
    }

    return coordinatesList;
  }

  //gestione di questo formato : 05o?=27’24?N , 052o?=40’00?W
  getCoordinateFormat2(coordinateExtract) {
    const coordinatesList = [];
    for (let coordinate of coordinateExtract) {
      let output = coordinate.replace(
        this.regex2,
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
    let direction = 1;
    const supp = angleStr.substring(0, angleStr.length - 1).split("-");
    const directionStr = angleStr.substring(
      angleStr.length - 1,
      angleStr.length
    );
    if (directionStr === "S" || directionStr === "W") direction = -1;
    const angle = Number(supp[0]) + Number(supp[1]) / 60;
    return direction * angle;
  }
}

module.exports = new CoordinatesExtractor();
