




const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,

  'jan.': 0, 'feb.': 1, mär: 2, mrz: 2, 'apr.': 3, mai: 4, 'jun.': 5,
  'jul.': 6, 'aug.': 7, 'sep.': 8, okt: 9, 'okt.': 9, 'nov.': 10,
  dez: 11, 'dez.': 11
};

function toDate(str = '') {
  const s = str.trim();
  if (!s) return new Date(NaN);

  
  const qMatch = /^Q([1-4])\s+(\d{4})$/.exec(s);
  if (qMatch) {
    const q  = Number(qMatch[1]) - 1; 
    const yr = Number(qMatch[2]);
    return new Date(yr, q * 3, 1);
  }

 
  const dmy = /^([0-9]{1,2})\s+([A-Za-zÀ-ÿ.]+)\s+(\d{2}|\d{4})$/.exec(s);
  if (dmy) {
    const dd = Number(dmy[1]);
    const mm = MONTHS[dmy[2].toLowerCase()];
    const yr = dmy[3].length === 2 ? 2000 + Number(dmy[3]) : Number(dmy[3]);
    return mm != null ? new Date(yr, mm, dd) : new Date(NaN);
  }

  
  const my = /^([A-Za-zÀ-ÿ.]+)\s+(\d{2}|\d{4})$/.exec(s);
  if (my) {
    const mm = MONTHS[my[1].toLowerCase()];
    const yr = my[2].length === 2 ? 2000 + Number(my[2]) : Number(my[2]);
    return mm != null ? new Date(yr, mm, 1) : new Date(NaN);
  }

  return new Date(s); 
}






// Nach toDate(...)
export function toQuarterLabel(str = '') {
  const s = String(str).trim();

  // Bereits "Qn YYYY" oder "Qn YY"?
  const m = /^q\s*([1-4])\s*(\d{2}|\d{4})$/i.exec(s);
  if (m) {
    const q = Number(m[1]);
    let y = Number(m[2]);
    if (y < 100) y = 2000 + y;
    return `Q${q} ${y}`;
  }

  // Generisch über toDate() -> Quartal bestimmen
  const d = toDate(s);
  if (isNaN(+d)) return s; // Fallback: originaler String
  const qn = Math.floor(d.getMonth() / 3) + 1;
  return `Q${qn} ${d.getFullYear()}`;
}















const REVENUE_ROW = {
  AAPL: 3, META: 3, MSFT: 3, GOOG: 3, AMZN: 3, TSLA: 3, NVDA: 3
};

function numericCells(line = {}) {
  return Object.entries(line)
    .filter(([k, v]) => k && v && !isNaN(String(v).replace(/,/g, '')))
    .map(([k, v]) => ({
      period: k.trim(),
      value: parseFloat(String(v).replace(/,/g, ''))
    }));
}

export function parseRevenue(rows = [], symbol = '') {
  if (!rows.length) return [];
  const idx  = REVENUE_ROW[symbol] ?? 0;
  const line = rows[idx] || rows[0];
  return numericCells(line).sort((a, b) => toDate(a.period) - toDate(b.period));
}

export function parseNetIncome(rows = []) {
  if (!rows.length) return [];
  const row = rows.find(r => /net\s*(income|profit)/i.test(String(r.metric || r.Metric)))
           || rows[3] || rows[0];
  return numericCells(row).sort((a, b) => toDate(a.period) - toDate(b.period));
}










export function getLastMargin(rows = []) {
  if (!rows?.length) return { period: '—', value: 0 };

  // 1) richtige Zeile (dein Titel + robuste Varianten)
  const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const isTarget = (txt) => {
    const m = norm(txt);
    return (
      m.includes('gross margin in % of last quarter reporting') ||
      /(gross.*margin).*(%|percent).*(last.*quarter)/i.test(m) ||
      /(brutto|rohmarge).*(%|prozent).*(zuletzt|letzte[nr]?|letzten).*quartal/i.test(m)
    );
  };
  const row =
    rows.find(r => isTarget(r.metric || r.Metric)) ||
    rows.find(r => /(gross|brutto).*(margin|marge)/i.test(norm(r.metric || r.Metric))) ||
    rows[0];

  // 2) Prozent robust 0..100 parsen
  const toPct = (raw) => {
    if (raw == null) return NaN;
    if (typeof raw === 'number') return raw <= 1 ? raw * 100 : raw;
    let s = String(raw).trim();
    s = s.replace(/%/g, '').replace(/\s+/g, '').replace(/[^\d,.-]/g, '');
    if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
    s = s.replace(/,/g, '');
    const n = parseFloat(s);
    if (!isFinite(n)) return NaN;
    return n <= 1 ? n * 100 : n;
  };

  // 3) Nur echte PERIODEN-Spalten zulassen (oder explizit LQ)
  const isPeriodKey = (key) => {
    const k = norm(key);
    // LQ / last / latest
    if (/\b(lq|last\s*quarter|latest)\b/i.test(k)) return true;
    // Quarter-Muster: Q2 2025, Q2'25, Q2-25, Q2 FY25, FY25 Q2
    if (/^q\s*[1-4]\s*(?:fy)?\s*['-]?\s*\d{2,4}$/.test(k)) return true;
    if (/^(?:fy)?\s*\d{2,4}\s*q\s*[1-4]$/.test(k)) return true;
    // Monat Jahr: Jun 25, Jun 2025, Okt. 24, mär 25
    if (/^[a-zà-ÿ.]+\s+\d{2,4}$/.test(k)) return true;
    // Tag Monat Jahr: 12 May 2025, 7 Mär 24
    if (/^\d{1,2}\s+[a-zà-ÿ.]+\s+\d{2,4}$/.test(k)) return true;
    return false;
  };

  // Einträge in Einfügereihenfolge (Object.entries) – wie in deinem Parser
  const entries = Object.entries(row)
    .filter(([k, v]) => k && v && !/^metric$/i.test(k))
    .map(([k, v], idx) => ({ idx, key: String(k).trim(), val: v }));

  // 3a) Kandidaten = nur Periodenkeys
  const periodEntries = entries.filter(e => isPeriodKey(e.key));

  // 3b) wenn es explizit eine LQ/last/latest-Spalte gibt → die nehmen
  const lqEntry = periodEntries.find(e => /\b(lq|last\s*quarter|latest)\b/i.test(norm(e.key)));

  // 3c) sonst: die RECHTSMOST periodische Spalte (letzte in der Reihe)
  const lastPeriodEntry = periodEntries.length ? periodEntries[periodEntries.length - 1] : null;

  const chosen = lqEntry || lastPeriodEntry;

  if (chosen) {
    const pct = toPct(chosen.val);
    if (isFinite(pct)) {
      return { period: chosen.key, value: Math.max(0, Math.min(100, pct)) };
    }
  }

  // 4) letzter Fallback: NICHTS (statt irgendeiner 100%-Hilfsspalte)
  return { period: '—', value: 0 };
}













export const __test = { toDate, numericCells };























