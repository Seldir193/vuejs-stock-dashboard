






















<script setup>
import { onMounted } from 'vue';
import { useSevenStore } from '@/stores/useSevenStore';
import RevenueWidget from '@/components/widgets/RevenueWidget.vue';
import RevenueChart from '@/components/widgets/RevenueChart.vue';
import RevenueBreakdown  from '@/components/widgets/RevenueBreakdown.vue';
import NetIncomeChart from '@/components/widgets/NetIncomeChart.vue';
import GrossMarginChart from '@/components/widgets/GrossMarginChart.vue';
import RevenueGrowthChart from '@/components/widgets/RevenueGrowthChart.vue';
const store = useSevenStore();
onMounted(() => store.fetchAll());   // kein top-level await nötig








import { ref, nextTick, onBeforeUnmount } from 'vue';

const track = ref(null);             // Zugriff auf .widget-row

const showPrev  = ref(false);      // ← neuer Reactive-State
const showRight = ref(false); 


function updateButtons () {
  const el = track.value;
  if (!el) return;
  showPrev.value = el.scrollLeft > 0;    // erst sichtbar, wenn gescrollt
  showRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}



function scrollNext () {
  const step = 173 + 24;
  track.value.scrollBy({ left: step * 6, behavior: 'smooth' });

  /* sofort sichtbar machen */
  showPrev.value  = true;

  /* bleibt: prüfen, ob rechts noch was übrig ist */
  
  nextTick(updateButtons);
}




function scrollPrev () {
  const el   = track.value;
  const step = 173 + 24;

  /* berechne, wo wir nach dem Scroll stehen werden */
  const newLeft = Math.max(el.scrollLeft - step * 6, 0);

  el.scrollBy({ left: -step * 6, behavior: 'smooth' });

  /* wenn neues Ziel 0 ist → Prev sofort ausblenden */
  if (newLeft === 0) showPrev.value = false;
 nextTick(updateButtons);
}





onMounted(() => {
  nextTick(updateButtons);                           // initial
  track.value.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);  // <- Zoom / Resize
});

onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', updateButtons);
  window.removeEventListener('resize', updateButtons);
});









window.s = store;  
</script>

<template>
  <div class="widget-wrapper">
    <button   v-if="showPrev"  class="scroll-btn prev" @click="scrollPrev">
    <img src="@/assets/img/Group1.png" alt="prev" />
  </button>
  <div ref="track"   class="widget-row">
    <RevenueWidget symbol="AAPL" />
    <RevenueWidget symbol="META" />  
     <RevenueWidget symbol="MSFT" />  
     <RevenueWidget symbol="GOOG" /> 
      <RevenueWidget symbol="AMZN" /> 
       <RevenueWidget symbol="TSLA" /> 
       <RevenueWidget symbol="NVDA" />

        <button v-if="showRight"  class="scroll-btn" @click="scrollNext">
      <img src="@/assets/img/Group1.png" alt="next" />
    </button>
  </div>
</div>


 <div class="chart-row">
    <RevenueChart    />
    <RevenueBreakdown />
  </div>
 

  <div class="chart-row" style="margin-top:20px">
    <NetIncomeChart  />
    <GrossMarginChart />
    <RevenueGrowthChart />
  </div>
</template>

<style>
body { margin: 0; }

#app {
  background: radial-gradient(71.11% 100% at 50% 0%, #020204 14.6%, #011F35 100%);
  padding: 100px;
  box-sizing: border-box;
  
  width: 100%;
  
  min-height: 100vh;
  

   
   
    display: flex;
  
    justify-content: center;

    align-items: center;
  flex-direction: column;


}



.chart-row{
  margin-top:20px;          /* Abstand unterhalb der Kartenleiste */
  display:flex;
  gap:32px;                 /* Abstand zwischen Chart-Cards */
  width:1240px;
}


/* Wrapper begrenzt Breite/Höhe & ist Bezug für absolute Button-Position */
.widget-wrapper {
  position: relative;         /* ② Button bezieht sich darauf */
  width: 1240px;              /* 6 Karten + 5 Gaps (173*6 + 24*5) ≈ 1240 */
  height: 192px;              /* eine Kartenhöhe */
  overflow: hidden;           /* zeigt nur 6 Karten, Rest wird abgeschnitten */
  
}

/* .widget-row bleibt flex-scrollbar, bekommt nur Breite weg */
.widget-row {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  overflow-y: hidden;
              /* füllt Wrapper */
  padding: 20px;              /* wie gehabt */
  background: #023A6233;      /* wie bisher */
}


.scroll-btn {
  position: absolute;
 right:0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}
.scroll-btn img { width: 32px; height: 32px; }

.scroll-btn.right { right: 0; }




.scroll-btn.prev {
  left: 0;
  right: auto;
  transform: translateY(-50%) rotateY(180deg);
}

</style>