





























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
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale
} from 'chart.js';
import BaseCard from '@/components/BaseCard.vue';
import { useSevenStore } from '@/stores/useSevenStore';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
dayjs.extend(quarterOfYear);

Chart.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const store = useSevenStore();

// Namen, zugehörige Ticker und Farben
const companies = [
  { name: 'Tesla',     ticker: 'TSLA', color: '#093A52' },
  { name: 'Meta',      ticker: 'META', color: '#11546F' },
  { name: 'Nvidia',    ticker: 'NVDA', color: '#196F8C' },
  { name: 'Amazon',    ticker: 'AMZN', color: '#218AA8' },
  { name: 'Microsoft', ticker: 'MSFT', color: '#29A5C5' },
  { name: 'Google',    ticker: 'GOOG', color: '#31BFE2' },
  { name: 'Apple',     ticker: 'AAPL', color: '#39DAFF' }
];

const labels = computed(() => {
  const arr = [];
  let qEnd = dayjs().subtract(1, 'quarter');
  for (let i = 0; i < 12; i++) {
    arr.unshift(`Q${qEnd.quarter()} ${qEnd.year()}`);
    qEnd = qEnd.subtract(1, 'quarter');
  }
  return arr;
});

const datasets = computed(() =>
  companies.map(c => {
    const series = store.revenueSeries(c.ticker)
      .slice(-12)
      .map(r => r.value / 1_000);
    const filled = Array.from({ length: 12 }, (_, i) => series[i] ?? null);
    return {
      label: c.name,                  // (Legend ist eh aus)
      data: filled,
      borderColor: c.color,
      backgroundColor: c.color,
      cubicInterpolationMode: 'monotone', // verhindert Overshoot
      tension: 0.2,
      clip: { left: 0, right: 0, top: 0, bottom: 0 }, // strikt im Plotbereich
      fill: false,
      spanGaps: true
    };
  })
);

const lastTtm = computed(() => {
  const res = {};
  companies.forEach(c => {
    const ser = store.revenueSeries(c.ticker).slice(-4);
    res[c.name] = ser.reduce((a, b) => a + b.value / 1_000, 0);
  });
  return res;
});

const data = computed(() => ({ labels: labels.value, datasets: datasets.value }));

const options = {
  responsive: true,
  maintainAspectRatio: false,
  events: [],              // keine Hover/Klicks
  animation: false,
  elements: {
    point: { radius: 0, hoverRadius: 0, hitRadius: 0 }, // keine Punkte
    line:  { borderWidth: 2 }
  },
  scales: {
    x: {
      ticks: { display: true, color: '#FFFFFF' },
      border:{ display: true, color: '#9E9E9E', width: 1 },
      grid:  {
        display: true,
        drawBorder: false, 
        color: '#9E9E9E',
        lineWidth: 1
      }
    },
    y: {
      min: 0,
      suggestedMax: 150, // oben Luft (Kacheln sichtbar), aber nur bis 90 beschriften
      ticks: {
        stepSize: 30,
         color:  '#FFFFFF',
        padding: 10, // Abstand Labels ↔ Achse/Grid
        callback: v => (Number(v) <= 90 ? v : '')
      },
       border:{ display: true, color: '#9E9E9E', width: 1 },
      grid: {
        display: true,
        drawTicks: false,  // keine kleinen "Spitzen" ins Grid
        drawBorder: false,
       color: '#9E9E9E',
         
        lineWidth: 1,
      }
    }
  },
  plugins: {
    legend:    { display: false },
    tooltip:   { enabled: false, external: undefined },
    datalabels:{ display: false } // falls global aktiv
  }
};
</script>

<style scoped>
.title { color:#fff; margin:0; font: 600 20px Rubik; }

/* Legende rechts absolut wie bei dir, aber mit Grid für sauberen Abstand */
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
  max-width: 200px; /* bleibt sicher in der Card */
}

.legend li{
  display:grid;
  grid-template-columns: 32px 1fr auto; /* Dot | Name | Zahl */
  align-items:center;
  column-gap:6px; /* >= 2px zwischen Name und Zahl */
  min-width:0;
}
.name{ overflow-wrap:anywhere; }
.value{
  margin-left:4px;      /* zusätzlicher Abstand (>=2px) */
  white-space:nowrap;   /* Zahl bleibt einzeilig */
  text-align:right;
}

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
  overflow: hidden; /* nix ragt raus */
}

:deep(.chart-card) {
  width: 714px;
  flex: 0 0 714px;
}
</style>
