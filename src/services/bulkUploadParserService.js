const csv = require("csv-parser");
const XLSX = require("xlsx");
const stream = require("stream");

class BulkUserService {

  //  Parse file
  static async parseFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      return this.parseCSV(file.data);
    } else if (ext === "xlsx") {
      return this.parseExcel(file.data);
    } else {
      throw new Error("Only CSV or Excel files are allowed");
    }
  }
  // parse csv
  static parseCSV(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];

      const readable = new stream.Readable();
      readable.push(buffer);
      readable.push(null);

      readable
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", reject);
    });
  }
  // parse excel
  static parseExcel(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  }

  //  Generate CSV buffer
  static generateCSVBuffer(data) {
    const headers = Object.keys(data[0]).join(",");

    const rows = data.map(obj =>
      Object.values(obj)
        .map(value => `"${String(value || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return Buffer.from([headers, ...rows].join("\n"));
  }
}

module.exports = BulkUserService;