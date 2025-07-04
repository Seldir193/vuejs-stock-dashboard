








/* src/utils/metrics.js */
const REVENUE_ROW = {          // Zeilen-Mapping aus deiner Checkliste
  AAPL: 3,   // 5. Zeile  ⇒ index 4
  META: 3,
  MSFT: 3,
  GOOG: 3,
  AMZN: 3,   // 9. Zeile  ⇒ index 8
  TSLA: 3,
  NVDA: 3,
    // 13. Zeile ⇒ index 12
};

export function parseRevenue(rows, symbol) {
  if (!rows?.length) return [];

  // 1) gewünschte Zeile wählen
  const idx = REVENUE_ROW[symbol] ?? 0;
  const line = rows[idx] || {};

  // 2) alle Spalten mit Zahlen erfassen
  return Object.entries(line)
    .filter(([k, v]) => k.trim() && v && !isNaN(v.replace(/,/g, '')))
    .map(([k, v]) => ({
      period: k.trim(),                       // z. B. "Mar 21"
      value : parseFloat(v.replace(/,/g, '')) // "95,678" → 95678
    }))
    .sort((a, b) => new Date(a.period) - new Date(b.period));
}

export const parseNetIncome = () => [];
export const getLastMargin  = () => ({ period: '–', value: 0 });