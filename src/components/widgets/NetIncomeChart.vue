


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














Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels)

const store = useSevenStore()

// Volle Namen, Ticker, Farben
const companies = [
  { name: 'Amazon',    ticker: 'AMZN', color: '#218AA8' },
  { name: 'Meta',      ticker: 'META', color: '#11546F' },
  { name: 'Google',    ticker: 'GOOG', color: '#31BFE2' },
  { name: 'Nvidia',    ticker: 'NVDA', color: '#196F8C' },
  { name: 'Tesla',     ticker: 'TSLA', color: '#093A52' },
  { name: 'Microsoft', ticker: 'MSFT', color: '#29A5C5' },
  { name: 'Apple',     ticker: 'AAPL', color: '#39DAFF' }
]

const labels = companies.map(c => c.name)

// Net Income **TTM** (nur letzter Wert), in Milliarden
const rawValues = computed(() =>
  companies.map(c => {
    const last = store.netIncomeSeries(c.ticker).at(-1)?.value ?? 0
    return last /1_000   // falls deine Quelle in Mio. USD ist; sonst entferne /1_000
  })
)

const data = computed(() => ({
  labels,
  datasets: [{
    label: 'TTM (Billion USD)',
    data: rawValues.value,                        // echte TTM-Werte
    raw: rawValues.value,
    backgroundColor: companies.map(c => c.color),
    borderRadius: 0,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    clip: { left: 0, right: 0, top: 0, bottom: 0 }
  }]
}))







const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  events: [],
  animation: false,

  // Platz rechts, damit Label 20px außerhalb sichtbar ist
  layout: { padding: { right: 64 } },
  scales: {
  x: {
    
      type: 'linear',
      min: 0,
      max: 100,
      ticks: {
        stepSize: 10,
        color: '#FFFFFF',
         maxRotation: 0,   // << gerade
        minRotation: 0 ,
        callback: v => (v % 20 === 0 ? v : '')
      },
      grid: {
        display: true,
        drawBorder: false,
        color: '#9E9E9E',
        lineWidth: 1
      },
      border: { display: true, color: '#9E9E9E', width: 1 }
    },




    y: {
     
     

      ticks: { color: '#FFFFFF', autoSkip: false, padding: 10 ,font: { size: 9 } },
      grid: {
        display: true,
        drawTicks: false,
        drawBorder: false,

          
        color: '#9E9E9E',
        lineWidth: 1
      },
      border: { display: true, color: '#9E9E9E', width: 1 }
    }
  },




  plugins: {
     zeroLineOverlay: false,
  legend: { display: false },
  tooltip: { enabled: false },

  

  datalabels: {
    formatter: (value, context) => {
      const raw = context.dataset.raw?.[context.dataIndex] ?? 0;
      return raw.toFixed(1);
    },
    color: ' #FFFFFF',
     font: { weight: '700', size: 12 }, 
    anchor: 'end', // Anker = rechtes Balkenende
    align: (context) => {
      const x = context.parsed?.x ?? 0;   // 0..100
      return x <= 80 ? 'start' : 'end';   // >=80: INSIDE (links vom Anker), sonst OUTSIDE (rechts)
    },
    offset: (context) => {
      const x = context.parsed?.x ?? 0;
      return x >= 80 ? 6 : 2;            // innen kleiner Abstand, außen 20px
    },
    textAlign: (context) => {
      const x = context.parsed?.x ?? 0;
      return x >= 80 ? 'right' : 'left';  // innen rechtsbündig an der Kante
    },
    clamp: false,
    clip: false
  }
}










}


</script>

<style scoped>
.ni-card{
  padding:20px;
  background:#011F35;
  border-radius:16px;
  display:flex;
  flex-direction:column;
  gap:16px;
  box-sizing:border-box;
  overflow: hidden;
}

.title{ color:#fff; margin:0; font:600 20px Rubik; }
.chart-wrap{ flex:1; min-height:0; width:352px; }
.chart-wrap canvas{ width:100%!important; height:100%!important; }
</style>









