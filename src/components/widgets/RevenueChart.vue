<template>
  <BaseCard class="chart-card">
    <h3 class="title">Revenue – last 3 years</h3>

    

    

     <div class="chart-wrapper">
    <Line :chart-data="data" :chart-options="options" :height="269" />
  </div>

    <!-- kompakte Legende rechts vom Chart -->
    <ul class="legend">
      <li v-for="s in symbols" :key="s">
        <span :style="{ background: colorMap[s] }" class="dot"></span>
        {{ s }} 
        <strong>{{ lastTtm[s].toFixed(1) }}</strong>
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

Chart.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const store   = useSevenStore();
const symbols = ['AAPL', 'META', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'NVDA'];



/* vom schwächsten (links) zum stärksten (rechts) */
const colorMap = {
  TSLA:'#093A52',
  META:'#11546F',
  NVDA:'#196F8C',
  AMZN:'#218AA8',
  MSFT:'#29A5C5',
  GOOG:'#31BFE2',
  AAPL:'#39DAFF'
};


/* X-Achse = 12 Quartale (Q1 2022 … Q4 2024) */
const labels = computed(() => {
  const q = ['Q1','Q2','Q3','Q4'];
  const years = [2022,2023,2024];
  return years.flatMap(y => q.map(qt => `${qt} ${y}`));
});

/* Datensätze pro Firma */
const datasets = computed(() =>
  symbols.map(sym => {
    /* drei Jahre = 12 Punkte; falls weniger -> mit null auffüllen */
    const series = store.revenueSeries(sym)
      .slice(-12)                               // letzte 12 Quartale
      .map(r => r.value / 1_000);               // in Mrd

    const filled = Array.from({ length: 12 }, (_, i) => series[i] ?? null);

    return {
      label: sym,
      data: filled,
      borderColor: colorMap[sym],
      backgroundColor: colorMap[sym],
      tension: 0.3,
      fill: false,
      spanGaps: true
    };
  })
);

/* Letzter TTM-Wert (Summe der letzten 4 Quartale) – für die Legende */
const lastTtm = computed(() => {
  const res = {};
  symbols.forEach(sym => {
    const ser = store.revenueSeries(sym).slice(-4);    // Q-1 … Q-4
    res[sym] = ser.reduce((a,b) => a + b.value/1_000, 0);  // Mrd
  });
  return res;
});

/* Chart-Config */
const data    = computed(() => ({ labels: labels.value, datasets: datasets.value }));
const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, ticks: { callback:v=>v+' B' } }
  },
  plugins: { legend: { display:false } }
};
</script>

<style scoped>


.title { color:#fff; margin:0; font: 600 18px Rubik; }








  /* Karte bleibt unverändert, ABER: position:relative ist schon gesetzt */

/* Legende: rechts, vertikal mittig */
.legend{
  list-style:none;
  margin:0; padding:0;
  position:absolute;
  top:50%;               /* Mitte */
  right:32px;
  transform:translateY(-50%);
  display:flex;
  flex-direction:column;
  gap:6px;
  font:400 12px Rubik;
  color:#fff; opacity:.9;
}

/* Farbbalken */
.dot{
  width:32px; height:12px;          /* 32 × 12 px laut Vorgabe */
  border:1px solid #ffffff33;       /* zarter Rahmen */
  border-radius:2px;
  display:inline-block;
  margin-right:6px;
}
















/* ② Canvas in voller Höhe/ Breite */
.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
   max-height: 269px !important;
}


/* Chart: feste Breite, kein Shrinking */
.chart-wrapper {
  width: 540px;        /* Zielbreite  */
  max-width: 540px;    /* Sicherheit   */
  flex: 0 0 540px;     /* verhindert Flex-Shrinking/Growing */
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
  position: relative;             /* ① Bezug für absolute Legende */
  overflow: hidden;
}

:deep(.chart-card) {
  width: 714px;
  flex: 0 0 714px;     /* verhindert, dass Flexbox sie zusammenschiebt */
}





</style>