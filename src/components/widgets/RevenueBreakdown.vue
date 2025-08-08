








<!-- src/components/widgets/RevenueBreakdown.vue -->
<template>
  <BaseCard class="donut-card">
    <h3 class="title">Revenue Breakdown&nbsp;Magnificent&nbsp;Seven</h3>

    <div class="content">
      <div class="donut-wrapper">
        <Pie :chart-data="chartData" :chart-options="options" :height="260" />
      </div>

      <ul class="legend">
        <li v-for="name in names" :key="name">
          <div class="legend-box">
          <span class="dot" :style="{ background: colorMap[name] }"></span>
          {{ name }}
          <strong>{{ ttm[name]?.toFixed(1) }}</strong>
          </div>
        </li>
      </ul>
    </div>

    <p class="unit">In&nbsp;Billion&nbsp;USD&nbsp;TTM</p>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import BaseCard from '@/components/BaseCard.vue';
import { useSevenStore } from '@/stores/useSevenStore';

Chart.register(ArcElement, Tooltip, Legend);

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

const names    = companies.map(c => c.name);
const colorMap = Object.fromEntries(companies.map(c => [c.name, c.color]));

const ttm = computed(() => {
  const out = {};
  companies.forEach(({ name, ticker }) => {
    const last4 = store.revenueSeries(ticker).slice(-4);
    out[name] = last4.reduce((a, b) => a + b.value / 1_000, 0); // Milliarden
  });
  return out;
});

const chartData = computed(() => ({
  labels: names, // volle Namen im Chart (Legende deaktiviert)
  datasets: [{
    data: names.map(n => ttm.value[n]),
    backgroundColor: names.map(n => colorMap[n]),
    borderColor: '#FFFFFF',
    borderWidth: 1,
    hoverOffset: 0
  }]
}));

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '55%',
  events: [], // keine Interaktion
  plugins: {
    legend:   { display: false }, // eigene Legende rechts
    tooltip:  { enabled: false }, // keine Zahlen im Canvas
    datalabels: { display: false }
  }
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
  box-sizing: border-box;
}

.title { color:#fff; margin:0; font:600 20px Rubik; }

/* Donut links, Legende rechts, 32px Abstand */
.content {
  display: flex;
  align-items: center;
  gap: 32px;
}

.donut-wrapper {
  width: 260px;
  height: 260px;
  flex: 0 0 260px;
}
.donut-wrapper canvas { width:100%!important; height:100%!important; }

/* Legende rechts */
.legend{
  list-style:none; margin:0; padding:0;
  display:flex; flex-direction:column; gap:6px;
  font:400 10px Rubik; color:#fff; opacity:.9;
}
.legend li { display:flex; align-items:center; }
.dot{
  width:32px; height:12px; border-radius:2px;
  border:1px solid #ffffff; margin-right:6px;
  display:inline-block;
}

.unit{
  position:absolute;
  right:20px;
  bottom:20px;
  font:400 10px Rubik; color:#fff; opacity:0.7;
}

.legend-box
{
  display: flex;
  gap:2px;
}
</style>





