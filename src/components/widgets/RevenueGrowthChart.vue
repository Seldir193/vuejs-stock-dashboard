<template>
  <BaseCard class="yoy-card">
    <h3 class="title">Revenue Growth in % YoY</h3>

    <div class="chart-wrap">
      <Bar :chart-data="chartData" :chart-options="options" :height="208"/>
    </div>

    <div class="quarter-legend">
  <div v-for="q in quarters" :key="q.key" class="legend-item">
    <span class="q-dot" :style="{ background:q.color }"></span>
    
    <span class="label">{{ q.key }}</span>
  </div>
</div>

  
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js';
import BaseCard from '@/components/BaseCard.vue';
import { useSevenStore } from '@/stores/useSevenStore';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/* ► Farbskala hell → dunkel */
const quarters = [
  { key:'Q1 2024', color:'#39DAFF' },
  { key:'Q4 2023', color:'#31BFE2' },
  { key:'Q3 2023', color:'#29A5C5' },
  { key:'Q2 2023', color:'#218AA8' }
];

const symbols = ['AAPL','MSFT','META','GOOG','NVDA','TSLA','AMZN'];
const store   = useSevenStore();

/* YoY-Growth für letzten 4 Quartale:  (Q1 24 vs Q1 23, …) */
function calcYoYGrowth(series, quarterKey){
  const idx = series.findIndex(r => r.period === quarterKey);
  if (idx === -1 || idx < 4) return 0;
  const now = series[idx].value;
  const prev = series[idx-4].value;
  return ((now - prev) / prev) * 100;
}

/* Datensätze je Quartal */
const datasets = computed(() => quarters.map(q => ({
  label: q.key,
  backgroundColor: q.color,
  data: symbols.map(sym =>
    calcYoYGrowth(store.revenueSeries(sym), q.key)?.toFixed(1)
  )
})));

/* Diagrammdaten & Optionen */
const chartData = computed(() => ({ labels:symbols, datasets:datasets.value }));

const options = {
  responsive:true,
  maintainAspectRatio:false,
  scales:{
    y:{ beginAtZero:true, max:90, ticks:{ stepSize:10, callback:v=>v+' ' } }
  },
  plugins:{ legend:{ display:false } }
};
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




}
.title{ color:#fff; margin:0; font:600 18px Rubik; }



.chart-wrap{
  width:354px;           
  height:100%;
}
.chart-wrap canvas{
  width:100%!important;
  height:100%!important;

}











/* Legende */
.quarter-legend{
  position:absolute;
  left:410px;           
  top:50%;
  transform:translateY(-50%);
  display:flex; 
  flex-direction:column; 
  gap:6px;
  font:400 12px Rubik; 
  color:#fff; 
  opacity:.9;
}











/* Legend-Container bleibt unverändert */

/* Farbbalken */
.q-dot{
  width:24px;
  height:8px;
  border:1px solid #ffffff33;
  border-radius:2px;
  display:inline-block;
}

























/* Quartal-Label (Q1 2024 usw.) */
.legend-item span.label{
  display:inline-block;     /* damit width/height greifen */
  width:40px;               /* ① 40 × 12 px */
  
  font-family:Rubik;        /* ② Typografie laut Vorgabe */
  font-weight:400;
  font-size:10px;
  line-height:100%;
  letter-spacing:0;
  color:#fff;
  overflow:hidden;          /* falls Text länger wird */
  white-space:nowrap;
}

.legend-item{
  display: flex;
  gap:6px;
}



</style>
