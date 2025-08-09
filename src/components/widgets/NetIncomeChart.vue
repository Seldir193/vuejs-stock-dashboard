<template>
  <BaseCard class="ni-card">
    <h3 class="title">Net Income TTM</h3>
    <div class="chart-wrap">
      <Bar :chart-data="data" :chart-options="options" :height="216" />
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
import { ttmSum } from '@/utils/metrics'

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

const ttmValues = computed(() =>
  companies.map(c => ttmSum(store.netIncomeSeries(c.ticker) ?? [], 1000))
)

function dlFormatter(_value, context) {
  const raw = context.dataset.raw?.[context.dataIndex] ?? 0
  return Number(raw).toFixed(1)
}
function dlAlign(context) {
  const x = context.parsed?.x ?? 0
  const max = context.chart?.scales?.x?.max ?? 100
  return x <= max * 0.8 ? 'start' : 'end'
}
function dlOffset(context) {
  const x = context.parsed?.x ?? 0
  const max = context.chart?.scales?.x?.max ?? 100
  return x >= max * 0.8 ? 6 : 2
}
function dlTextAlign(context) {
  const x = context.parsed?.x ?? 0
  const max = context.chart?.scales?.x?.max ?? 100
  return x >= max * 0.8 ? 'right' : 'left'
}

const datalabelsConfig = {
  formatter: dlFormatter,
  color: '#FFFFFF',
  font: { weight: '700', size: 12 },
  anchor: 'end',
  align: dlAlign,
  offset: dlOffset,
  textAlign: dlTextAlign,
  clamp: false,
  clip: false
}

const X_SCALE = {
  type: 'linear',
  min: 0,
  max: 500,
  ticks: {
    stepSize: 50,
    color: '#FFFFFF',
    maxRotation: 0,
    minRotation: 0,
    callback: v => (v % 100 === 0 ? v : '')
  },
  grid: { display: true, drawBorder: false, color: '#9E9E9E', lineWidth: 1 },
  border: { display: true, color: '#9E9E9E', width: 1 }
}

const Y_SCALE = {
  ticks: { color: '#FFFFFF', autoSkip: false, padding: 10, font: { size: 9 } },
  grid: { display: true, drawTicks: false, drawBorder: false, color: '#9E9E9E', lineWidth: 1 },
  border: { display: true, color: '#9E9E9E', width: 1 }
}

const TOOLTIP = {
  enabled: true,
  intersect: false,
  mode: 'nearest',
  displayColors: false,
  callbacks: {
    title: (items) => items?.[0]?.label ?? '',
    label: (ctx) => `${Number(ctx.raw ?? ctx.parsed?.x ?? 0).toFixed(1)} B`
  }
}

const PLUGINS = {
  zeroLineOverlay: false,
  legend: { display: false },
  tooltip: TOOLTIP,
  datalabels: datalabelsConfig
}

const BASE_OPTIONS = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
  animation: false,
  layout: { padding: { right: 64 } },
  scales: { x: X_SCALE, y: Y_SCALE },
  plugins: PLUGINS
}

const data = computed(() => ({
  labels,
  datasets: [{
    label: 'TTM (Billion USD)',
    data: ttmValues.value,
    raw: ttmValues.value,
    backgroundColor: companies.map(c => c.color),
    borderRadius: 0,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    clip: { left: 0, right: 0, top: 0, bottom: 0 }
  }]
}))

const options = computed(() => BASE_OPTIONS)
</script>

<style scoped>
.ni-card {
  padding: 20px;
  background: #011F35;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  overflow: hidden;
}
.title {
  color: #fff;
  margin: 0;
  font: 600 20px Rubik;
}
.chart-wrap {
  flex: 1;
  min-height: 0;
  width: 352px;
}
.chart-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>

