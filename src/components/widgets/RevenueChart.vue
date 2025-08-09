<template>
  <BaseCard class="chart-card">
    <h3 class="title">Revenue – last 3 years</h3>
    <div class="chart-wrapper">
      <Line :chart-data="data" :chart-options="options" :height="269" />
    </div>
    <ul class="legend">
      <li v-for="c in companies" :key="c.ticker">
        <span class="dot" :style="{ background: c.color }"></span>
        <span class="name">{{ c.name }}</span>
        <strong class="value">{{ lastTtm[c.name]?.toFixed(1) }}</strong>
      </li>
    </ul>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
import BaseCard from '@/components/BaseCard.vue'
import { useSevenStore } from '@/stores/useSevenStore'
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
dayjs.extend(quarterOfYear)

Chart.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const store = useSevenStore()

const companies = [
  { name: 'Tesla', ticker: 'TSLA', color: '#093A52' },
  { name: 'Meta', ticker: 'META', color: '#11546F' },
  { name: 'Nvidia', ticker: 'NVDA', color: '#196F8C' },
  { name: 'Amazon', ticker: 'AMZN', color: '#218AA8' },
  { name: 'Microsoft', ticker: 'MSFT', color: '#29A5C5' },
  { name: 'Google', ticker: 'GOOG', color: '#31BFE2' },
  { name: 'Apple', ticker: 'AAPL', color: '#39DAFF' }
]

const labels = computed(() => {
  const out = []
  let qEnd = dayjs().subtract(1, 'quarter')
  for (let i = 0; i < 12; i++) {
    out.unshift(`Q${qEnd.quarter()} ${qEnd.year()}`)
    qEnd = qEnd.subtract(1, 'quarter')
  }
  return out
})

function buildDataset(c) {
  const series = (store.revenueSeries(c.ticker) ?? []).slice(-12).map(r => r.value / 1_000)
  const filled = Array.from({ length: 12 }, (_, i) => series[i] ?? null)
  return {
    label: c.name,
    data: filled,
    borderColor: c.color,
    backgroundColor: c.color,
    cubicInterpolationMode: 'monotone',
    tension: 0.2,
    clip: { left: 0, right: 0, top: 0, bottom: 0 },
    fill: false,
    spanGaps: true
  }
}

const datasets = computed(() => companies.map(buildDataset))

const lastTtm = computed(() => {
  const res = {}
  companies.forEach(c => {
    const ser = (store.revenueSeries(c.ticker) ?? []).slice(-4)
    res[c.name] = ser.reduce((a, b) => a + (b?.value ?? 0) / 1_000, 0)
  })
  return res
})

const data = computed(() => ({ labels: labels.value, datasets: datasets.value }))

function createTooltipEl(chart) {
  let el = chart.canvas.parentNode.querySelector('.ext-tooltip')
  if (el) return el
  el = document.createElement('div')
  el.className = 'ext-tooltip'
  Object.assign(el.style, {
    position: 'absolute',
    pointerEvents: 'none',
    background: 'rgba(1,31,53,0.96)',
    border: '1px solid #2A4E6B',
    borderRadius: '8px',
    padding: '8px 10px',
    font: '12px Rubik, sans-serif',
    color: '#fff',
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
    zIndex: 10,
    opacity: 0
  })
  chart.canvas.parentNode.appendChild(el)
  return el
}

function formatTooltipHTML(chart, idx) {
  const qLabel = chart.data.labels?.[idx] ?? ''
  const rows = chart.data.datasets.map(ds => {
    const v = ds.data[idx]
    const val = v == null || isNaN(v) ? '—' : `${Number(v).toFixed(2)} B`
    return `<div style="display:flex;align-items:center;gap:8px;">
      <span style="width:10px;height:10px;background:${ds.borderColor};border-radius:2px;display:inline-block;"></span>
      <span style="min-width:86px;opacity:.9">${ds.label}</span>
      <span style="font-weight:700">${val}</span>
    </div>`
  })
  return `<div style="margin-bottom:6px;font-weight:700;color:#9EDBFF">${qLabel}</div>${rows.join('')}`
}

function positionTooltip(chart, tooltip, el) {
  const { offsetLeft: pl, offsetTop: pt } = chart.canvas
  el.style.opacity = 1
  el.style.left = pl + tooltip.caretX + 12 + 'px'
  el.style.top = pt + tooltip.caretY + 12 + 'px'
}

function externalTooltipHandler(ctx) {
  const { chart, tooltip } = ctx
  const el = createTooltipEl(chart)
  if (tooltip.opacity === 0) {
    el.style.opacity = 0
    return
  }
  const idx = tooltip.dataPoints?.[0]?.dataIndex ?? -1
  if (idx >= 0) el.innerHTML = formatTooltipHTML(chart, idx)
  positionTooltip(chart, tooltip, el)
}

const X_SCALE = {
  ticks: { display: true, color: '#FFFFFF' },
  border: { display: true, color: '#9E9E9E', width: 1 },
  grid: { display: true, drawBorder: false, color: '#9E9E9E', lineWidth: 1 }
}
const Y_SCALE = {
  min: 0,
  suggestedMax: 150,
  ticks: { stepSize: 30, color: '#FFFFFF', padding: 10, callback: v => (Number(v) <= 90 ? v : '') },
  border: { display: true, color: '#9E9E9E', width: 1 },
  grid: { display: true, drawTicks: false, drawBorder: false, color: '#9E9E9E', lineWidth: 1 }
}
const ELEMENTS = { point: { radius: 0, hoverRadius: 0, hitRadius: 0 }, line: { borderWidth: 2 } }
const TOOLTIP = { enabled: false, external: externalTooltipHandler }

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  animation: false,
  elements: ELEMENTS,
  scales: { x: X_SCALE, y: Y_SCALE },
  plugins: { legend: { display: false }, tooltip: TOOLTIP, datalabels: { display: false } }
}
</script>

<style scoped>
.title { color:#fff; margin:0; font: 600 20px Rubik; }
.legend{
  list-style:none;
  margin:0; padding:0;
  position:absolute;
  top:50%;
  right:32px;
  transform:translateY(-50%);
  display:flex;
  flex-direction:column;
  gap:6px;
  font:400 10px Rubik;
  color:#fff; opacity:.9;
  max-width: 200px;
}
.legend li{
  display:grid;
  grid-template-columns: 32px 1fr auto;
  align-items:center;
  column-gap:6px;
  min-width:0;
}
.name{ overflow-wrap:anywhere; }
.value{ margin-left:4px; white-space:nowrap; text-align:right; }
.dot{
  width:32px; height:12px;
  border: 1px solid white;
  border-radius:2px;
  display:inline-block;
}
.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
  max-height: 269px !important;
}
.chart-wrapper {
  width: 540px;
  max-width: 540px;
  flex: 0 0 540px;
  max-height: 269px;
}
.chart-card {
  width: 100%;
  max-width: 714px;
  padding: 20px 32px;
  background:#011F35;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap:20px;
  position: relative;
  overflow: hidden;
}
:deep(.chart-card) {
  width: 714px;
  flex: 0 0 714px;
}
</style>



























