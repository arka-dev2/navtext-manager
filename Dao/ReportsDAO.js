const conn = require("../Object/conn");
const Report = require("../Entity/Report");

class ReportsDAO {
  getAllReport() {
    let reports = [];

    const query = "SELECT * FROM reports";
    const results = conn.query(query);

    for (let result of results) {
      this.getReport(result.link);
    }
    return reports;
  }

  getReport(link) {
    let report = null;

    const query = "SELECT * FROM reports where link = ?";
    const values = [id];
    const result = conn.query(query, values);

    if (result.length !== 0) {
      const coordinates = [];
      const query = "SELECT * FROM coordinates where link = ?";
      const values = [result.link];
      const coordinatesResult = conn.query(query, values);

      for (let cordinateResult of coordinatesResult) {
        coordinates.push({
          latitude: cordinateResult.latitude,
          longitude: cordinateResult.longitude,
        });
      }
      report = new Report(result.link, result.type, result.date, coordinates);
    }
    return report;
  }

  insertReport(report) {
    const query = "insert into reports (link, type, date) values(?,?,?)";
    const values = [report.link, report.type, report.date];
    conn.query(query, values);

    let count = 1;
    for (let coordinate of report.coordinates) {
      const query =
        "insert into coordinates (link, coordinate_id, longitude, latitude) values(?,?,?,?)";
      const values = [
        report.link,
        count++,
        coordinate.longitude,
        coordinate.latitude,
      ];
      conn.query(query, values);
    }
  }
}

module.exports = new ReportsDAO();
