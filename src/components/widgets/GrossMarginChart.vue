<template>
  <BaseCard class="gm-card">
    <h3 class="title">Gross Margin in % LQ</h3>

    <div class="chart-wrap">
      <Bar :chart-data="data" :chart-options="options" :height="209" />
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import BaseCard from '@/components/BaseCard.vue'
import { useSevenStore } from '@/stores/useSevenStore'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels)

const store = useSevenStore()

const companies = [
  { name: 'Amazon', ticker: 'AMZN', color: '#218AA8' },
  { name: 'Meta', ticker: 'META', color: '#11546F' },
  { name: 'Google', ticker: 'GOOG', color: '#31BFE2' },
  { name: 'Nvidia', ticker: 'NVDA', color: '#196F8C' },
  { name: 'Tesla', ticker: 'TSLA', color: '#093A52' },
  { name: 'Microsoft', ticker: 'MSFT', color: '#29A5C5' },
  { name: 'Apple', ticker: 'AAPL', color: '#39DAFF' }
]

const labels = companies.map(c => c.name)

function toPercent(v) {
  if (v == null) return 0
  const str = String(v).trim().replace(/\s/g, '')
  const num = Number(str.endsWith('%') ? str.slice(0, -1).replace(',', '.') : str.replace(',', '.'))
  if (!isFinite(num)) return 0
  return num <= 1 ? num * 100 : num
}

const values = computed(() =>
  companies.map(c => {
    const raw = store.marginLast(c.ticker)?.value ?? 0
    return toPercent(raw)
  })
)

const lastQ = computed(() => {
  const o = {}
  companies.forEach(c => { o[c.name] = store.marginLast(c.ticker)?.period || '—' })
  return o
})

const data = computed(() => ({
  labels,
  datasets: [{
    data: values.value,
    backgroundColor: companies.map(c => c.color),
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: { topLeft: 4, bottomLeft: 4, topRight: 0, bottomRight: 0 }
  }]
}))

const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,

  scales: {
    x: {
      type: 'linear',
      min: 0,
      max: 100,
      ticks: { stepSize: 20, display: false, maxRotation: 0, minRotation: 0 },
      grid: { display: true, drawTicks: false, drawBorder: false, color: '#9E9E9E', lineWidth: 1 },
      border: { display: true, color: '#9E9E9E', width: 1 }
    },
    y: {
      ticks: {
        color: '#FFFFFF',
        autoSkip: false,
        padding: 10,
        font: { size: 10 }
      },
      grid: { display: true, drawTicks: false, drawBorder: false, color: '#9E9E9E', lineWidth: 1 },
      border: { display: true, color: '#9E9E9E', width: 1 }
    }
  },

  plugins: {
    zeroLineOverlay: false,
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${(ctx.parsed.x ?? 0).toFixed(1)} %`,
        afterLabel: (ctx) => `latest: ${lastQ.value[ctx.label]}`
      }
    },
    datalabels: {
      color: '#FFFFFF',
      anchor: 'end',
      align: 'right',
      formatter: (_v, ctx) => `${Number(ctx.dataset.data[ctx.dataIndex] ?? 0).toFixed(1)} %`
    }
  }
}
</script>

<style scoped>
.gm-card {
  padding: 20px;
  background: #011F35;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
}

.title {
  color: #fff;
  margin: 0;
  font: 600 20px Rubik;
}

.chart-wrap {
  flex: 1;
  min-height: 0;
  width: 252px;
}

.chart-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
