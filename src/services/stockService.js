import axios from "axios";
const MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,

  "jan.": 0,
  "feb.": 1,
  mär: 2,
  mrz: 2,
  "apr.": 3,
  mai: 4,
  "jun.": 5,
  "jul.": 6,
  "aug.": 7,
  "sep.": 8,
  okt: 9,
  "okt.": 9,
  "nov.": 10,
  dez: 11,
  "dez.": 11,
};

function toDate(str) {
  if (!str) return new Date(NaN);
  const parts = str.trim().split(/\s+/);
  if (parts.length === 2) {
    const [mon, yy] = parts;
    return new Date(2000 + +yy, MONTHS[mon.toLowerCase()], 1);
  }
  if (parts.length === 3) {
    const [dd, mon, yy] = parts;
    return new Date(2000 + +yy, MONTHS[mon.toLowerCase()], +dd);
  }
  return new Date(NaN);
}

class StockService {
  constructor() {
    this.apiClient = axios.create({
      // baseURL: 'https://sheetdb.io/api/v1/8qaot0bu6vekv'
      //baseURL: "https://sheetdb.io/api/v1/cj14uwz5djka4",
      baseURL: process.env.VUE_APP_SHEETDB_BASE,
    });
  }

  async fetchData(sheetName) {
    const { data } = await this.apiClient.get("", {
      params: { sheet: sheetName },
    });
    return data;
  }

  async getRevenue(symbol = "AAPL") {
    const rows = await this.fetchData(`$${symbol}`);
    const row =
      rows.find((r) =>
        String(r.metric || r.Metric || "")
          .toLowerCase()
          .includes("revenue"),
      ) ||
      rows[3] ||
      rows[0] ||
      {};
    return Object.entries(row)
      .filter(([p, v]) => p.trim() && v && !isNaN(v.replace(/,/g, "")))
      .map(([p, v]) => ({
        period: p.trim(),
        value: parseFloat(v.replace(/,/g, "")),
      }))
      .sort((a, b) => toDate(a.period) - toDate(b.period));
  }
}

export const stockService = new StockService();
