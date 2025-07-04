<!-- src/components/widgets/RevenueBreakdown.vue -->
<template>
  <BaseCard class="donut-card">
    <h3 class="title">Revenue Breakdown&nbsp;Magnificent&nbsp;Seven</h3>

    <!-- Donut-Chart -->
    <div class="donut-wrapper">
      <Pie :chart-data="chartData" :chart-options="options" :height="260" />
    </div>

    <!-- Legende rechts -->
    <ul class="legend">
      <li v-for="sym in symbols" :key="sym">
        <span class="dot" :style="{ background: colorMap[sym] }"></span>
        {{ sym }}
      </li>
      
    </ul>
    <p class="unit">In&nbsp;Billion&nbsp;USD&nbsp;TTM</p>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import {
  Chart, ArcElement, Tooltip, Legend
} from 'chart.js';
import BaseCard from '@/components/BaseCard.vue';
import { useSevenStore } from '@/stores/useSevenStore';

Chart.register(ArcElement, Tooltip, Legend);

/* Farbskala vom schwächsten zum stärksten */
const colorMap = {
  TSLA:'#093A52',
  META:'#11546F',
  NVDA:'#196F8C',
  AMZN:'#218AA8',
  MSFT:'#29A5C5',
  GOOG:'#31BFE2',
  AAPL:'#39DAFF'
};


const symbols = Object.keys(colorMap);
const store   = useSevenStore();

/* TTM-Umsatz (Summe der letzten 4 Quartale) pro Firma */
const ttm = computed(() => {
  const out = {};
  symbols.forEach(sym => {
    const last4 = store.revenueSeries(sym).slice(-4);
    out[sym] = last4.reduce((a,b)=>a + b.value/1_000, 0); // in Mrd
  });
  return out;
});

/* ChartJS-Dataset */
const chartData = computed(() => ({
  labels: symbols,
  datasets: [{
    data: symbols.map(s => ttm.value[s]),
    backgroundColor: symbols.map(s => colorMap[s]),
    borderColor: '#011F35',
    borderWidth: 2,
    hoverOffset: 4
  }]
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',          /* macht daraus einen Donut */
  plugins: { legend:{ display:false } }
};
</script>

<style scoped>
.donut-card {
  width: 494px;
  
  padding: 20px 49px;
  background:#011F35;
  border-radius:16px;
  display:flex;
  flex-direction:column;
  gap:20px;
  position: relative;
}

.title { color:#fff; margin:0; font:600 18px Rubik; }

/* Donut nimmt gesamte Card-Höhe – Legende ist absolut */
.donut-wrapper { flex:1; min-height:0; }
.donut-wrapper canvas { width:100%!important; height:100%!important; }

/* Legende mittig rechts */
.legend{
  list-style:none; margin:0; padding:0;
  position:absolute; right:20px; top:50%;
  transform:translateY(-50%);
  display:flex; flex-direction:column; gap:6px;
  font:400 12px Rubik; color:#fff; opacity:.9;
}
.dot{
  width:32px; height:12px; border-radius:2px;
  border:1px solid #ffffff33; margin-right:6px;
  display:inline-block;
}

.unit{
  position:absolute;
  right:20px;               /* gleiche X-Achse wie Legende */
  bottom:20px;              /* 20 px Abstand zum Kartenrand */
  font:400 10px Rubik;
  color:#fff;
  opacity:0.7;              /* dezenter */
}
</style>
