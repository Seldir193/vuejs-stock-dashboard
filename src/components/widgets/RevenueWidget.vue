<template>
  <BaseCard class="revenue-widget">
    <div class="title-row">
      <img v-if="logoMap[symbol]" :src="logoMap[symbol]" class="logo" alt="logo" />
      <h3 class="symbol">{{ symbol }}</h3>
    </div>
    <p class="label">Revenue {{ quarterLabel }}</p>
    <div class="row">
      <div class="value-box">
        <span class="value">{{ formattedValue }}</span>
        <span class="unit">In&nbsp;Bill&nbsp;USD</span>
      </div>
      <div class="delta-box">
        <div class="delta" :class="deltaClass">
          <span>{{ deltaSign }}{{ deltaAbs.toFixed(1) }}</span>
          <img :src="arrowSrc" class="arrow" alt="arrow" />
        </div>
        <div class="percent" :class="deltaClass">
          {{ deltaRel.toFixed(1) }}%
          <img :src="percentSrc" class="percent-icon" alt="percent" />
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
/* global defineProps */
import arrowUp from '@/assets/img/arrow_upward_alt.png';
import percentIcon from '@/assets/img/percent.png';
import arrowDown from '@/assets/img/arrow_downward_alt.png';
import percentRed from '@/assets/img/percentred.png';
import { computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { useSevenStore } from '@/stores/useSevenStore';
import metaLogo from '@/assets/img/meta.png';
import appleLogo from '@/assets/img/aapl.png';
import msftLogo from '@/assets/img/msft.png';
import googLogo from '@/assets/img/google1.png';
import amazonLogo from '@/assets/img/amazon.png';
import teslaLogo from '@/assets/img/tesla.png';
import nvidiaLogo from '@/assets/img/nvda.svg';

const logoMap = {
  META: metaLogo,
  AAPL: appleLogo,
  MSFT: msftLogo,
  GOOG: googLogo,
  AMZN: amazonLogo,
  TSLA: teslaLogo,
  NVDA: nvidiaLogo
};

const arrowSrc = computed(() => (deltaAbs.value >= 0 ? arrowUp : arrowDown));
const percentSrc = computed(() => (deltaAbs.value >= 0 ? percentIcon : percentRed));
const props = defineProps({ symbol: { type: String, required: true } });
const store = useSevenStore();
const series = computed(() => store.revenueSeries(props.symbol) ?? []);
const latest = computed(() => series.value.at(-1) ?? { period: '', value: 0 });
const previous = computed(() => series.value.at(-2) ?? null);
const diff = computed(() => (previous.value ? latest.value.value - previous.value.value : 0));
const deltaAbs = computed(() => diff.value / 1_000);
const deltaRel = computed(() => (previous.value ? (diff.value / previous.value.value) * 100 : 0));
const deltaSign = computed(() => (deltaAbs.value > 0 ? '+' : ''));
const deltaClass = computed(() => (deltaAbs.value >= 0 ? 'pos' : 'neg'));

function toQuarterLabel(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}
const quarterLabel = computed(() => toQuarterLabel(latest.value.period));

const formattedValue = computed(() =>
  latest.value.value
    ? (latest.value.value / 1_000).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    : '—'
);
</script>

<style scoped>
.revenue-widget {
  width: 173px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 24px;
  color: #fff;
  box-sizing: border-box;
}

.symbol {
  margin: 0;
  font-family: Rubik;
  font-weight: 500;
  font-size: 20px;
  line-height: 100%;
  letter-spacing: 0%;
}

.label {
  opacity: 0.8;
  font-family: Rubik;
  font-weight: 400;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: 0%;
}

.row {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.value-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.value {
  font-family: Rubik;
  font-weight: 500;
  font-size: 24px;
  line-height: 100%;
  letter-spacing: 0%;
}

.unit {
  opacity: 0.8;
  margin-top: 4px;
  font-family: Rubik;
  font-weight: 400;
  font-size: 8px;
  line-height: 100%;
  letter-spacing: 0%;
}

.delta-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.delta {
  display: flex;
  align-items: center;
  font-family: Rubik;
  font-weight: 500;
  font-size: 13px;
  line-height: 100%;
  letter-spacing: 0%;
}

.arrow {
  width: 20px;
  height: 20px;
}

.rotate {
  transform: rotate(180deg);
}

.percent {
  margin-top: 2px;
  display: flex;
  align-items: center;
  font-family: Rubik;
  font-weight: 500;
  font-size: 13px;
  line-height: 100%;
  letter-spacing: 0%;
  gap: 2px;
}

.percent-icon {
  width: 20px;
  height: 20px;
}

.pos {
  color: #3BA752;
}

.neg {
  color: #C41C1C;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>