// metrics.js

// -------------------------------
// Month map (EN + DE, inkl. Abk.)
// -------------------------------
const MONTHS = {
  jan: 0, 'jan.': 0,
  feb: 1, 'feb.': 1,
  mar: 2, 'mar.': 2,
  mär: 2, 'mär.': 2, mrz: 2, 'mrz.': 2, maerz: 2, 'maerz.': 2,
  apr: 3, 'apr.': 3,
  may: 4, mai: 4, 'mai.': 4,
  jun: 5, 'jun.': 5, june: 5,
  jul: 6, 'jul.': 6, july: 6,
  aug: 7, 'aug.': 7,
  sep: 8, 'sep.': 8, sept: 8, 'sept.': 8,
  oct: 9, 'oct.': 9, okt: 9, 'okt.': 9,
  nov: 10, 'nov.': 10,
  dec: 11, 'dec.': 11, dez: 11, 'dez.': 11
};

// -------------------------------
// Date/Quarter parsing helpers
// -------------------------------
export function toDate(str = '') {
  const s = String(str).trim();
  if (!s) return new Date(NaN);

  // Qn YYYY | Qn'YY | Qn-YY | Qn FY25 | FY25 Qn
  let m = /^q\s*([1-4])\s*(?:fy)?\s*['-]?\s*(\d{2,4})$/i.exec(s);
  if (!m) m = /^(?:fy)?\s*['-]?\s*(\d{2,4})\s*q\s*([1-4])$/i.exec(s) && {
    0: s, 1: RegExp.$2, 2: RegExp.$1
  };
  if (m) {
    const q = Number(m[1]) - 1;
    let y = Number(m[2]);
    if (y < 100) y = 2000 + y;
    return new Date(y, q * 3, 1);
  }

  // Qn YYYY (einfache Form, z. B. "Q2 2025")
  const qSimple = /^Q([1-4])\s+(\d{4})$/i.exec(s);
  if (qSimple) {
    const q  = Number(qSimple[1]) - 1;
    const yr = Number(qSimple[2]);
    return new Date(yr, q * 3, 1);
  }

  // DD Mon YYYY | D Mon YY
  let dmy = /^([0-9]{1,2})\s+([A-Za-zÀ-ÿ.]+)\s+(\d{2}|\d{4})$/.exec(s);
  if (dmy) {
    const dd = Number(dmy[1]);
    const mm = MONTHS[dmy[2].toLowerCase()];
    let yr = Number(dmy[3]);
    if (yr < 100) yr = 2000 + yr;
    return mm != null ? new Date(yr, mm, dd) : new Date(NaN);
  }

  // Mon DD, YYYY | Mon DD YYYY
  let mdy = /^([A-Za-zÀ-ÿ.]+)\s+([0-9]{1,2}),?\s+(\d{2}|\d{4})$/.exec(s);
  if (mdy) {
    const mm = MONTHS[mdy[1].toLowerCase()];
    const dd = Number(mdy[2]);
    let yr = Number(mdy[3]);
    if (yr < 100) yr = 2000 + yr;
    return mm != null ? new Date(yr, mm, dd) : new Date(NaN);
  }

  // Mon YYYY | Mon YY
  let my = /^([A-Za-zÀ-ÿ.]+)\s+(\d{2}|\d{4})$/.exec(s);
  if (my) {
    const mm = MONTHS[my[1].toLowerCase()];
    let yr = Number(my[2]);
    if (yr < 100) yr = 2000 + yr;
    return mm != null ? new Date(yr, mm, 1) : new Date(NaN);
  }

  // ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, mth, d] = s.split('-').map(Number);
    return new Date(y, mth - 1, d);
  }

  // Fallback: native Parser (kann je nach Browser variieren)
  return new Date(s);
}

export function toQuarterLabel(str = '') {
  const s = String(str).trim();

  // Bereits "Qn YYYY" oder "Qn YY"
  let m = /^q\s*([1-4])\s*(\d{2}|\d{4})$/i.exec(s);
  if (!m) m = /^q\s*([1-4])\s*(?:fy)?\s*['-]?\s*(\d{2,4})$/i.exec(s);
  if (m) {
    const q = Number(m[1]);
    let y = Number(m[2]);
    if (y < 100) y = 2000 + y;
    return `Q${q} ${y}`;
  }

  // Oder "FY25 Q2"
  const m2 = /^(?:fy)?\s*['-]?\s*(\d{2,4})\s*q\s*([1-4])$/i.exec(s);
  if (m2) {
    const q = Number(m2[2]);
    let y = Number(m2[1]);
    if (y < 100) y = 2000 + y;
    return `Q${q} ${y}`;
  }

  // Generisch über Datum
  const d = toDate(s);
  if (isNaN(+d)) return s;
  const qn = Math.floor(d.getMonth() / 3) + 1;
  return `Q${qn} ${d.getFullYear()}`;
}

// -------------------------------
// Helpers für Tabellenzeilen
// -------------------------------
function numericCells(line = {}) {
  return Object.entries(line)
    .filter(([k, v]) => k && v && !/^metric$/i.test(k) && !isNaN(String(v).replace(/,/g, '')))
    .map(([k, v]) => ({
      period: String(k).trim(),
      value: parseFloat(String(v).replace(/,/g, ''))
    }));
}

// Für parseRevenue – je Symbol welche Zeile (Fallback: 0)
const REVENUE_ROW = {
  AAPL: 3, META: 3, MSFT: 3, GOOG: 3, AMZN: 3, TSLA: 3, NVDA: 3
};

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

  const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  // Prozent 0..100
  const toPct = (raw) => {
    if (raw == null) return NaN;
    if (typeof raw === 'number') return raw <= 1 ? raw * 100 : raw;
    let s = String(raw).trim();
    s = s.replace(/%/g, '').replace(/\s+/g, '').replace(/[^\d,.-]/g, '');
    if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
    s = s.replace(/,/g, '');
    const n = parseFloat(s);
    if (!isFinite(n)) return NaN;
    const pct = n <= 1 ? n * 100 : n;
    return Math.max(0, Math.min(100, pct));
  };

  // Perioden-Erkennung (deckt viele Formate ab)
  const isPeriodKey = (key) => {
    const k = norm(key);
    if (/\b(lq|last\s*quarter|latest)\b/i.test(k)) return true;
    if (/^q\s*[1-4]\s*(?:fy)?\s*['-]?\s*\d{2,4}$/i.test(k)) return true;
    if (/^(?:fy)?\s*['-]?\s*\d{2,4}\s*q\s*[1-4]$/i.test(k)) return true;
    if (/^[a-zà-ÿ.]+\s+\d{2,4}$/i.test(k)) return true;
    if (/^\d{1,2}\s+[a-zà-ÿ.]+\s+\d{2,4}$/i.test(k)) return true;
    if (/^[a-zà-ÿ.]+\s+\d{1,2},?\s+\d{2,4}$/i.test(k)) return true;
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) return true;
    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(k)) return true;
    return false;
  };

  const looksGrossMargin = (title) => {
    const m = norm(title);
    return /gross/.test(m) && /(margin|marge|profit\s*margin)/.test(m) && /(%|percent|ratio)/.test(m);
  };

  // 🚫 typische Flag-/Coverage-Zeilen mit lauter 100
  const looksSuspicious = (title) => {
    const m = norm(title);
    return /(last\s*quarter\s*report(ing)?|of\s+last\s+quarter\s+reporting|availability|available|coverage|reported|disclosure|companies)/.test(m);
  };

  // 1) Versuche, eine echte GM-%-Zeile zu nehmen
  const scored = rows.map(r => {
    const title = r.metric || r.Metric || '';
    let score = 0;
    if (looksGrossMargin(title)) score += 3;
    if (!looksSuspicious(title)) score += 2;

    const vals = Object.entries(r)
      .filter(([k, v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
      .map(([, v]) => toPct(v))
      .filter(v => isFinite(v));

    if (!vals.length) score -= 5;

    // viele 100 → Flag-Row
    const ratio100 = vals.length ? vals.filter(v => v === 100).length / vals.length : 0;
    const ratio0   = vals.length ? vals.filter(v => v === 0).length   / vals.length : 0;
    const mid = vals.slice().sort((a,b)=>a-b)[Math.floor(vals.length/2)] ?? NaN;
    if (ratio100 > 0.5) score -= 6;
    if (ratio0   > 0.5) score -= 2;
    if (isFinite(mid) && mid >= 10 && mid <= 90) score += 2;

    return { row: r, title, score };
  }).sort((a,b)=>b.score-a.score);

  const best = scored[0]?.row;

  if (best && scored[0].score >= 1) {
    // nimm LQ/last/latest, sonst NEUESTES Datum
    const entries = Object.entries(best)
      .filter(([k, v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
      .map(([k, v]) => ({ key: String(k).trim(), val: toPct(v), date: toDate(k) }))
      .filter(e => isFinite(e.val));

    if (entries.length) {
      const lq = entries.find(e => /\b(lq|last\s*quarter|latest)\b/i.test(norm(e.key)));
      const chosen = lq || entries.sort((a,b)=>(+a.date||-Infinity)-(+b.date||-Infinity)).at(-1);
      if (chosen && isFinite(chosen.val) && chosen.val !== 100) {
        return { period: chosen.key, value: chosen.val };
      }
    }
  }

  // 2) Fallback: aus Gross Profit & Revenue berechnen (neuester gemeinsamer Zeitraum)
  const computed = computeGrossMarginFromComponents(rows);
  if (computed) return computed;

  // 3) letzter Fallback
  return { period: '—', value: 0 };
}

/* == Helfer: aus Gross Profit & Revenue berechnen == */
function computeGrossMarginFromComponents(rows = []) {
  const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const toNum = (raw) => {
    if (raw == null) return NaN;
    if (typeof raw === 'number') return raw;
    let s = String(raw).trim().replace(/\s+/g, '');
    s = s.replace(/[^\d,.-]/g, '');
    if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
    s = s.replace(/,/g, '');
    const n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  };

  const isPeriodKey = (k) => {
    const x = norm(k);
    return (
      /\b(lq|last\s*quarter|latest)\b/i.test(x) ||
      /^q\s*[1-4]\s*(?:fy)?\s*['-]?\s*\d{2,4}$/i.test(x) ||
      /^(?:fy)?\s*['-]?\s*\d{2,4}\s*q\s*[1-4]$/i.test(x) ||
      /^[a-zà-ÿ.]+\s+\d{2,4}$/i.test(x) ||
      /^\d{1,2}\s+[a-zà-ÿ.]+\s+\d{2,4}$/i.test(x) ||
      /^[a-zà-ÿ.]+\s+\d{1,2},?\s+\d{2,4}$/i.test(x) ||
      /^\d{4}-\d{2}-\d{2}$/.test(x) ||
      /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(x)
    );
  };

  const findRow = (pred) => rows.find(r => pred(norm(r.metric || r.Metric || '')));

  const revRow = findRow(t => /(revenue|sales)/.test(t) && !/growth|yoy|qoq|per\s*share|ttm/i.test(t));
  const gpRow  = findRow(t => /(gross\s*profit)/.test(t) && !/margin|%|percent|ratio|ttm/i.test(t));

  if (!revRow || !gpRow) return null;

  const revEntries = Object.entries(revRow)
    .filter(([k,v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
    .map(([k,v]) => ({ key: String(k).trim(), val: toNum(v), date: toDate(k) }))
    .filter(e => isFinite(e.val));

  const gpEntries = Object.entries(gpRow)
    .filter(([k,v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
    .map(([k,v]) => ({ key: String(k).trim(), val: toNum(v), date: toDate(k) }))
    .filter(e => isFinite(e.val));

  if (!revEntries.length || !gpEntries.length) return null;

  // Map nach Datum (Tag-genau). Wir wählen den NEUESTEN gemeinsamen.
  const byDateRev = new Map(revEntries.map(e => [+e.date, e]));
  const commons = gpEntries
    .filter(e => byDateRev.has(+e.date))
    .sort((a,b)=>(+a.date)-(+b.date));

  const last = commons.at(-1);
  if (!last) return null;

  const rev = byDateRev.get(+last.date).val;
  const gp  = last.val;
  if (!(rev > 0 && gp >= 0)) return null;

  const pct = Math.max(0, Math.min(100, (gp / rev) * 100));
  return { period: last.key, value: pct };
}


export const __test = { toDate, numericCells };

















