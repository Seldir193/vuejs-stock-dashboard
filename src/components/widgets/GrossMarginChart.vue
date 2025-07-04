<template>
  <BaseCard class="gm-card">
    <h3 class="title">Gross Margin in % LQ</h3>

    <div class="chart-wrap">
      <Bar
        :chart-data="data"
        :chart-options="options"
        :height="209"
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

/* Farbskala identisch zu den anderen Charts */
const colorMap = {
  TSLA:'#093A52',
  META:'#11546F',
  NVDA:'#196F8C',
  AMZN:'#218AA8',
  MSFT:'#29A5C5',
  GOOG:'#31BFE2',
  AAPL:'#39DAFF'
};

const symbols = ['Amazon','Meta','Google','Nvidia','Tesla','Microsoft','Apple'];
const store   = useSevenStore();


const values = computed(() =>
  symbols.map(sym => store.marginLast(sym).value));


const data = computed(() => ({
  labels: symbols,
  datasets: [{
    data: values.value,
    backgroundColor: symbols.map(s => colorMap[s]),
    borderRadius: 4
  }]
}));

/* Optionen: X-Achse ausgeblendet, Werte als Label am Balken */
const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales:{
    x:{ display:false, min:0, max:100 }   // keine Achse sichtbar
  },
  plugins:{
    legend:{ display:false },
    datalabels:{
      color:'#fff', anchor:'end', align:'right',
      formatter:v => v.toFixed(1) + '%'
    }
  }
};
</script>

<style scoped>
.gm-card{
  
  
  padding:20px;
  background:#011F35;
  border-radius:16px;
  display:flex;
  flex-direction:column;
  gap:16px;
}

.title{ color:#fff; margin:0; font:600 18px Rubik; }

.chart-wrap{ flex:1; min-height:0; width:252px; }
.chart-wrap canvas{ width:100%!important; height:100%!important; }
</style>
