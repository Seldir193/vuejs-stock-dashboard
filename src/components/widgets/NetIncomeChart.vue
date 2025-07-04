<template>
  <BaseCard class="ni-card">
    <h3 class="title">Net Income TTM</h3>

    <div class="chart-wrap">
      <Bar
        :chart-data="data"
        :chart-options="options"
        :height="216"
      />
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import BaseCard from '@/components/BaseCard.vue';
import { useSevenStore } from '@/stores/useSevenStore';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

/* Farbskala (schwach → stark) */
const colorMap = {
  TSLA:'#093A52',
  META:'#11546F',
  NVDA:'#196F8C',
  AMZN:'#218AA8',
  MSFT:'#29A5C5',
  GOOG:'#31BFE2',
  AAPL:'#39DAFF'
};

/* Reihenfolge im Chart (Y-Achse oben → unten) */
const symbols = ['Amazon','Meta','Google','Nvidia','Tesla','Microsoft','Apple'];

const store = useSevenStore();

/* TTM-Gewinn (= Summe der letzten 4 Quartale) */
const values = computed(() =>
  symbols.map(sym =>
    store.netIncomeSeries(sym)        // ←  musst du im Store anlegen
      .slice(-4)
      .reduce((a,b)=>a + b.value/1_000, 0)   // in Mrd USD
  )
);

/* Chart.js-Daten-Objekt */
const data = computed(() => ({
  labels: symbols,                    // Y-Achse
  datasets: [{
    label: 'TTM (Billion USD)',
    data: values.value,
    backgroundColor: symbols.map(s => colorMap[s]),
    borderRadius: 4,
  }]
}));

/* Optionen: horizontale Balken, Werte rechts am Balken */
const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { beginAtZero:true, ticks:{ callback:v=>v } }
  },
  plugins:{
    legend: { display:false },
    datalabels:{
      color:'#fff',
      anchor:'end',
      align:'right',
      formatter:v=>v.toFixed(1)
    }
  }
};
</script>

<style scoped>
.ni-card{
   
  padding:20px;
  background:#011F35;
  border-radius:16px;
  display:flex;
  flex-direction:column;
  gap:16px;
}

.title{ color:#fff; margin:0; font:600 18px Rubik; }

/* Chart-Container */
.chart-wrap{ flex:1; min-height:0; width:352px; }
.chart-wrap canvas{ width:100%!important; height:100%!important; }
</style>
