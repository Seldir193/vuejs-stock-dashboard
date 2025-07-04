/* src/services/stockService.js */
import axios from 'axios';

/* Monatstabellen – jede Abkürzung nur EINMAL */
const MONTHS = {
  /* englisch */
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  /* deutsch */
  'jan.': 0, 'feb.': 1, mär: 2, mrz: 2, 'apr.': 3, mai: 4, 'jun.': 5,
  'jul.': 6, 'aug.': 7, 'sep.': 8, okt: 9, 'okt.': 9, 'nov.': 10,
  dez: 11, 'dez.': 11
};

/* "Mar 21" | "3 Aug 23" | "30 Jan 25" → Date */
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
      baseURL: 'https://sheetdb.io/api/v1/8qaot0bu6vekv'
    });
  }

  async fetchData(sheetName) {
    const { data } = await this.apiClient.get('', { params: { sheet: sheetName } });
    return data;
  }

  async getRevenue(symbol = 'AAPL') {
    const rows = await this.fetchData(`$${symbol}`);

    /* Revenue-Zeile finden: zuerst per „Metric“, sonst Fallback Zeile 3 oder 0 */
    const row =
      rows.find(r => String(r.metric || r.Metric || '').toLowerCase().includes('revenue')) ||
      rows[3] ||
      rows[0] ||
      {};

    /* spalten → { period, value }  + sortieren nach echtem Datum */
    return Object.entries(row)
      .filter(([p, v]) => p.trim() && v && !isNaN(v.replace(/,/g, '')))
      .map(([p, v]) => ({
        period: p.trim(),
        value : parseFloat(v.replace(/,/g, ''))
      }))
      .sort((a, b) => toDate(a.period) - toDate(b.period));   // _ts entfällt
  }
}

export const stockService = new StockService();
