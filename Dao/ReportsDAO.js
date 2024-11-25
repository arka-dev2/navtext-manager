const conn = require("../conn");
const Report = require("../Entity/Report");

class ReportsDAO {
  getAllReport() {
    let reports = [];

    const query = "SELECT * FROM reports";
    const results = conn.query(query);

    for (let result of results) {
      const coordinates = [];
      const query = "SELECT * FROM coordinates where report_id = ?";
      const values = [result.report_id];
      const coordinatesResult = conn.query(query, values);

      for (let cordinateResult of coordinatesResult) {
        coordinates.push({
          latitude: cordinateResult.latitude,
          longitude: cordinateResult.longitude,
        });
      }
      const report = new Report(
        result.report_id,
        result.link,
        result.type,
        result.date,
        coordinates
      );
      reports.push(report);
    }
    return reports;
  }

  getReport(id) {
    let report = null;

    const query = "SELECT * FROM reports where report_id = ?";
    const values = [id];
    const result = conn.query(query, values);

    if (result.length !== 0) {
      const coordinates = [];
      const query = "SELECT * FROM coordinates where report_id = ?";
      const values = [result.report_id];
      const coordinatesResult = conn.query(query, values);

      for (let cordinateResult of coordinatesResult) {
        coordinates.push({
          latitude: cordinateResult.latitude,
          longitude: cordinateResult.longitude,
        });
      }
      report = new Report(
        result.report_id,
        result.link,
        result.type,
        result.date,
        coordinates
      );
    }
    return report;
  }

  insertReport(report) {
    const id = this.#getMaxId() + 1;
    const query =
      "insert into reports (report_id, link, type, date) values(?,?,?,?)";
    const values = [id, report.link, report.type, report.date];
    conn.query(query, values);

    let count = 1;
    for (let coordinate of report.coordinates) {
      const query =
        "insert into coordinates (report_id, coordinate_id, longitude, latitude) values(?,?,?,?)";
      const values = [id, count++, coordinate.longitude, coordinate.latitude];
      conn.query(query, values);
    }
  }

  #getMaxId() {
    const query = "select max(report_id) as max from reports";
    const result = conn.query(query);
    return result[0].max === null ? 0 : result[0].max;
  }
}

module.exports = new ReportsDAO();
