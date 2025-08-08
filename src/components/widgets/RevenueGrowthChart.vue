

























<template>
  <BaseCard class="yoy-card">
    <h3 class="title">Revenue Growth in % YoY</h3>

    <div class="chart-wrap">
      <Bar :chart-data="chartData" :chart-options="options" :height="208"/>
    </div>

    <div class="quarter-legend">
      <div v-for="(q, i) in legendQuarters" :key="q" class="legend-item">
        <span class="q-dot" :style="{ background: quarterShades[i] }"></span>
        <span class="label">{{ q }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import BaseCard from '@/components/BaseCard.vue'
import { useSevenStore } from '@/stores/useSevenStore'
import { toQuarterLabel } from '@/utils/metrics'   // ✅ zentraler Helper

// 0-Linie oben drüber zeichnen – mit Guards, damit es nie crasht
const zeroLineOverlay = {
  id: 'zeroLineOverlay',
  afterDatasetsDraw(chart, _args, opts) {
    const { ctx, chartArea, scales } = chart
    if (!chartArea || !scales || !scales.y) return
    const y0 = scales.y.getPixelForValue(0)
    if (!Number.isFinite(y0)) return
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(chartArea.left, y0)
    ctx.lineTo(chartArea.right, y0)
    ctx.lineWidth = (opts && opts.lineWidth) || 1
    ctx.strokeStyle = (opts && opts.color) || '#9E9E9E'
    ctx.stroke()
    ctx.restore()
  }
}

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, zeroLineOverlay)

const store = useSevenStore()

const companies = [
  { name: 'Apple',     ticker: 'AAPL' },
  { name: 'Microsoft', ticker: 'MSFT' },
  { name: 'Meta',      ticker: 'META' },
  { name: 'Google',    ticker: 'GOOG' },
  { name: 'Nvidia',    ticker: 'NVDA' },
  { name: 'Tesla',     ticker: 'TSLA' },
  { name: 'Amazon',    ticker: 'AMZN' }
]
const symbols       = companies.map(c => c.ticker)
const companyLabels = companies.map(c => c.name)

// Blautöne: hell (alt) → dunkel (neu)
const quarterShades = [
  'rgba(49,191,226,0.35)',
  'rgba(49,191,226,0.55)',
  'rgba(49,191,226,0.75)',
  'rgba(49,191,226,1)'
]

// YoY der letzten 4 Quartale (indexbasiert aus den letzten 8 Punkten)
function computeYoYLast4(seriesNums) {
  const len = seriesNums.length
  if (len < 8) return [null, null, null, null]
  const last8 = seriesNums.slice(-8)
  return [4,5,6,7].map(i => {
    const curr = last8[i], prev = last8[i-4]
    if (curr == null || prev == null || prev === 0) return null
    return ((curr - prev) / prev) * 100
  })
}

const yoyMap = computed(() => {
  const map = {}
  symbols.forEach(sym => {
    const serie = (store.revenueSeries(sym) || []).map(p => Number(p.value))
    map[sym] = computeYoYLast4(serie)
  })
  return map
})

const legendQuarters = computed(() => {
  const ref = store.revenueSeries('AAPL') || []
  return ref.slice(-4).map(p => toQuarterLabel(p.period))
})

const datasets = computed(() =>
  [0,1,2,3].map(i => ({
    label: legendQuarters.value[i] ?? `Q${i+1}`,
    backgroundColor: quarterShades[i],

    
    borderColor: '#FFFFFF',
    
    borderWidth: 1,             // ✅ keine Border
    
    hoverBorderWidth: 1,
    borderSkipped: false,
    borderRadius: 0,            // ✅ eckig
    base: 0,                    // ✅ startet exakt auf 0
    clip: { left: 0, right: 0, top: 0, bottom: 0 },
    data: symbols.map(sym => {
      const raw = yoyMap.value[sym]?.[i]
      if (raw == null) return null
      return Math.min(90, Math.max(0, raw)) // ✅ clamp 0..90
    })
  }))
)

const chartData = computed(() => ({
  labels: companyLabels,
  datasets: datasets.value
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },

  datasets: { bar: { base: 0, borderWidth: 0, borderRadius: 0 } },

  scales: {
    x: {
      ticks: { display: true, color: '#FFFFFF', font: { size: 10 }, autoSkip: false, maxRotation: 0, minRotation: 0 },
      grid:  { display: false, drawBorder: false } // keine vertikalen Linien / keine x-Border
    },
    y: {
      min: 0,
      max: 90,
      ticks: { stepSize: 10, color: '#FFFFFF', padding: 8, callback: v => v },
      grid: {
        display: true,            // horizontale Linien inkl. 0-Linie
        drawBorder: true,         // linke Achsenlinie 0→90
        borderColor: '#9E9E9E',
        borderWidth: 1,
        drawTicks: false,
        color: '#9E9E9E',
        lineWidth: 1
      }
    }
  },

  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
    datalabels: { display: false },
    zeroLineOverlay: { color: '#9E9E9E', lineWidth: 1 }
  },

  layout: { padding: 0 }
}
</script>

<style scoped>
.yoy-card{
  width:491px;
  padding:20px;
  background:#011F35;
  border-radius:16px;
  display:flex;
  flex-direction:column;
  gap:16px;
  position:relative;
  box-sizing:border-box;
}
.title{ color:#fff; margin:0; font:600 20px Rubik; }

.chart-wrap{ width:354px; height:100%; }
.chart-wrap canvas{ width:100%!important; height:100%!important; }

.quarter-legend{
  position:absolute;
  left:410px;
  top:50%;
  transform:translateY(-50%);
  display:flex; flex-direction:column; gap:6px;
  font:400 8px Rubik; color:#fff; opacity:.9;
}
.q-dot{ width:24px; height:8px; border:1px solid #ffffff33; border-radius:2px; display:inline-block; }
.legend-item{ display:flex; gap:6px; }
.legend-item .label{
  display:inline-block; width:60px; font-family:Rubik; font-weight:400; font-size:8px; line-height:100%; color:#fff; white-space:nowrap; overflow:hidden;
}
</style>
