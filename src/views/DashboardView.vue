
<script setup >

import RevenueWidget from '@/components/widgets/RevenueWidget.vue';

import { useSevenStore } from '@/stores/useSevenStore';
const store = useSevenStore();
 store.fetchAll();               
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <RevenueWidget symbol="AAPL" />
    <RevenueWidget symbol="MSFT" />
    <RevenueWidget symbol="AMZN" />
    <RevenueWidget symbol="GOOG" />
    <RevenueWidget symbol="META" />
    <RevenueWidget symbol="NVDA" />
    <RevenueWidget symbol="TSLA" />
  </div>
</template>