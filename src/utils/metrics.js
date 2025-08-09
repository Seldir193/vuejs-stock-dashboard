// src/utils/metrics.js
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
}

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim()

function parseQuarterForm(s) {
  let m = /^q\s*([1-4])\s*(?:fy)?\s*['-]?\s*(\d{2,4})$/i.exec(s)
  if (!m) {
    const m2 = /^(?:fy)?\s*['-]?\s*(\d{2,4})\s*q\s*([1-4])$/i.exec(s)
    if (m2) m = { 1: m2[2], 2: m2[1] }
  }
  if (m) {
    const q = Number(m[1]) - 1
    let y = Number(m[2])
    if (y < 100) y = 2000 + y
    return new Date(y, q * 3, 1)
  }
  const qs = /^q([1-4])\s+(\d{4})$/i.exec(s)
  if (qs) return new Date(Number(qs[2]), (Number(qs[1]) - 1) * 3, 1)
  return null
}

function parseDMY(s) {
  const m = /^([0-9]{1,2})\s+([A-Za-zÀ-ÿ.]+)\s+(\d{2}|\d{4})$/.exec(s)
  if (!m) return null
  const dd = Number(m[1])
  const mm = MONTHS[m[2].toLowerCase()]
  let y = Number(m[3])
  if (y < 100) y = 2000 + y
  return mm != null ? new Date(y, mm, dd) : null
}

function parseMDY(s) {
  const m = /^([A-Za-zÀ-ÿ.]+)\s+([0-9]{1,2}),?\s+(\d{2}|\d{4})$/.exec(s)
  if (!m) return null
  const mm = MONTHS[m[1].toLowerCase()]
  const dd = Number(m[2])
  let y = Number(m[3])
  if (y < 100) y = 2000 + y
  return mm != null ? new Date(y, mm, dd) : null
}

function parseMY(s) {
  const m = /^([A-Za-zÀ-ÿ.]+)\s+(\d{2}|\d{4})$/.exec(s)
  if (!m) return null
  const mm = MONTHS[m[1].toLowerCase()]
  let y = Number(m[2])
  if (y < 100) y = 2000 + y
  return mm != null ? new Date(y, mm, 1) : null
}

function parseISO(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toDate(str = '') {
  const s = String(str).trim()
  if (!s) return new Date(NaN)
  return (
    parseQuarterForm(s) ||
    parseDMY(s) ||
    parseMDY(s) ||
    parseMY(s) ||
    parseISO(s) ||
    new Date(s)
  )
}

export function toQuarterLabel(str = '') {
  const s = String(str).trim()
  let m = /^q\s*([1-4])\s*(\d{2}|\d{4})$/i.exec(s)
  if (!m) m = /^q\s*([1-4])\s*(?:fy)?\s*['-]?\s*(\d{2,4})$/i.exec(s)
  if (m) {
    let y = Number(m[2])
    if (y < 100) y = 2000 + y
    return `Q${Number(m[1])} ${y}`
  }
  const m2 = /^(?:fy)?\s*['-]?\s*(\d{2,4})\s*q\s*([1-4])$/i.exec(s)
  if (m2) {
    let y = Number(m2[1])
    if (y < 100) y = 2000 + y
    return `Q${Number(m2[2])} ${y}`
  }
  const d = toDate(s)
  if (isNaN(+d)) return s || '—'
  const qn = Math.floor(d.getMonth() / 3) + 1
  return `Q${qn} ${d.getFullYear()}`
}

export function toPercent(v) {
  if (v == null) return 0
  let s = String(v).trim().replace(/\s+/g, '')
  s = s.endsWith('%') ? s.slice(0, -1) : s
  s = s.replace(',', '.')
  let n = Number(s)
  if (!isFinite(n)) return 0
  if (n <= 1) n *= 100
  return Math.max(0, Math.min(100, n))
}

function numericCells(line = {}) {
  return Object.entries(line)
    .filter(([k, v]) => k && v && !/^metric$/i.test(k) && !isNaN(String(v).replace(/,/g, '')))
    .map(([k, v]) => ({ period: String(k).trim(), value: parseFloat(String(v).replace(/,/g, '')) }))
}

const REVENUE_ROW = { AAPL: 3, META: 3, MSFT: 3, GOOG: 3, AMZN: 3, TSLA: 3, NVDA: 3 }

export function parseRevenue(rows = [], symbol = '') {
  if (!rows.length) return []
  const idx = REVENUE_ROW[symbol] ?? 0
  const line = rows[idx] || rows[0]
  return numericCells(line).sort((a, b) => toDate(a.period) - toDate(b.period))
}

export function parseNetIncome(rows = []) {
  if (!rows.length) return []
  const row = rows.find(r => /net\s*(income|profit)/i.test(String(r.metric || r.Metric))) || rows[3] || rows[0]
  return numericCells(row).sort((a, b) => toDate(a.period) - toDate(b.period))
}

function isPeriodKey(key) {
  const k = norm(key)
  if (/\b(lq|last\s*quarter|latest)\b/i.test(k)) return true
  if (/^q\s*[1-4]\s*(?:fy)?\s*['-]?\s*\d{2,4}$/i.test(k)) return true
  if (/^(?:fy)?\s*['-]?\s*\d{2,4}\s*q\s*[1-4]$/i.test(k)) return true
  if (/^[a-zà-ÿ.]+\s+\d{2,4}$/i.test(k)) return true
  if (/^\d{1,2}\s+[a-zà-ÿ.]+\s+\d{2,4}$/i.test(k)) return true
  if (/^[a-zà-ÿ.]+\s+\d{1,2},?\s+\d{2,4}$/i.test(k)) return true
  if (/^\d{4}-\d{2}-\d{2}$/.test(k)) return true
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(k)) return true
  return false
}

function looksGrossMargin(title) {
  const m = norm(title)
  return /gross/.test(m) && /(margin|marge|profit\s*margin)/.test(m) && /(%|percent|ratio)/.test(m)
}

function looksSuspicious(title) {
  const m = norm(title)
  return /(last\s*quarter\s*report(ing)?|of\s+last\s+quarter\s+reporting|availability|available|coverage|reported|disclosure|companies)/.test(m)
}

function toPct(raw) {
  if (raw == null) return NaN
  if (typeof raw === 'number') return Math.max(0, Math.min(100, raw <= 1 ? raw * 100 : raw))
  let s = String(raw).trim()
  s = s.replace(/%/g, '').replace(/\s+/g, '').replace(/[^\d,.-]/g, '')
  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.')
  s = s.replace(/,/g, '')
  const n = parseFloat(s)
  if (!isFinite(n)) return NaN
  const pct = n <= 1 ? n * 100 : n
  return Math.max(0, Math.min(100, pct))
}

export function getLastMargin(rows = []) {
  if (!rows?.length) return { period: '—', value: 0 }
  const scored = rows
    .map(r => {
      const title = r.metric || r.Metric || ''
      let score = 0
      if (looksGrossMargin(title)) score += 3
      if (!looksSuspicious(title)) score += 2
      const vals = Object.entries(r)
        .filter(([k, v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
        .map(([, v]) => toPct(v))
        .filter(v => isFinite(v))
      if (!vals.length) score -= 5
      const ratio100 = vals.length ? vals.filter(v => v === 100).length / vals.length : 0
      const ratio0 = vals.length ? vals.filter(v => v === 0).length / vals.length : 0
      const mid = vals.slice().sort((a, b) => a - b)[Math.floor(vals.length / 2)] ?? NaN
      if (ratio100 > 0.5) score -= 6
      if (ratio0 > 0.5) score -= 2
      if (isFinite(mid) && mid >= 10 && mid <= 90) score += 2
      return { row: r, score }
    })
    .sort((a, b) => b.score - a.score)
  const best = scored[0]?.row
  if (best && scored[0].score >= 1) {
    const entries = Object.entries(best)
      .filter(([k, v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
      .map(([k, v]) => ({ key: String(k).trim(), val: toPct(v), date: toDate(k) }))
      .filter(e => isFinite(e.val))
    if (entries.length) {
      const lq = entries.find(e => /\b(lq|last\s*quarter|latest)\b/i.test(norm(e.key)))
      const chosen = lq || entries.sort((a, b) => (+a.date || -Infinity) - (+b.date || -Infinity)).at(-1)
      if (chosen && isFinite(chosen.val) && chosen.val !== 100) return { period: chosen.key, value: chosen.val }
    }
  }
  const computed = computeGrossMarginFromComponents(rows)
  if (computed) return computed
  return { period: '—', value: 0 }
}

function toNum(raw) {
  if (raw == null) return NaN
  if (typeof raw === 'number') return raw
  let s = String(raw).trim().replace(/\s+/g, '')
  s = s.replace(/[^\d,.-]/g, '')
  if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.')
  s = s.replace(/,/g, '')
  const n = parseFloat(s)
  return isFinite(n) ? n : NaN
}

function computeGrossMarginFromComponents(rows = []) {
  const findRow = (pred) => rows.find(r => pred(norm(r.metric || r.Metric || '')))
  const revRow = findRow(t => /(revenue|sales)/.test(t) && !/growth|yoy|qoq|per\s*share|ttm/i.test(t))
  const gpRow = findRow(t => /(gross\s*profit)/.test(t) && !/margin|%|percent|ratio|ttm/i.test(t))
  if (!revRow || !gpRow) return null
  const revEntries = Object.entries(revRow)
    .filter(([k, v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
    .map(([k, v]) => ({ key: String(k).trim(), val: toNum(v), date: toDate(k) }))
    .filter(e => isFinite(e.val))
  const gpEntries = Object.entries(gpRow)
    .filter(([k, v]) => k && v && !/^metric$/i.test(k) && isPeriodKey(k))
    .map(([k, v]) => ({ key: String(k).trim(), val: toNum(v), date: toDate(k) }))
    .filter(e => isFinite(e.val))
  if (!revEntries.length || !gpEntries.length) return null
  const byDateRev = new Map(revEntries.map(e => [+e.date, e]))
  const commons = gpEntries.filter(e => byDateRev.has(+e.date)).sort((a, b) => (+a.date) - (+b.date))
  const last = commons.at(-1)
  if (!last) return null
  const rev = byDateRev.get(+last.date).val
  const gp = last.val
  if (!(rev > 0 && gp >= 0)) return null
  const pct = Math.max(0, Math.min(100, (gp / rev) * 100))
  return { period: last.key, value: pct }
}

export function sumLastN(series = [], n = 4, accessor = (x) => x) {
  const part = series.slice(-n)
  return part.reduce((acc, x) => acc + (Number(accessor(x)) || 0), 0)
}

export function ttmSum(series = [], divisor = 1000) {
  const sum = sumLastN(series, 4, (p) => p?.value ?? 0)
  return sum / (divisor || 1)
}

export function computeYoYLast4(seriesNums = []) {
  const len = seriesNums.length
  if (len < 8) return [null, null, null, null]
  const last8 = seriesNums.slice(-8)
  return [4, 5, 6, 7].map(i => {
    const curr = Number(last8[i])
    const prev = Number(last8[i - 4])
    if (!isFinite(curr) || !isFinite(prev) || prev === 0) return null
    return ((curr - prev) / prev) * 100
  })
}

export const __test = { toDate, numericCells }
















