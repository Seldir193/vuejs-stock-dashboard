// stores/useSevenStore.js
import { defineStore } from 'pinia';
import { stockService } from '@/services/stockService';
import { parseRevenue, parseNetIncome, getLastMargin } from '@/utils/metrics';


const SYMBOLS = ['AAPL', 'META','AMZN', 'GOOG', 'MSFT', 'NVDA', 'TSLA'];
export const useSevenStore = defineStore('seven', {
  state: () => ({
    rows: {},         // { AAPL: [...], AMZN: [...] }
    loading: false,
    error: null
  }),
  getters: {
    revenueSeries: (s) => (sym) => parseRevenue(s.rows[sym], sym),
    netIncomeSeries: (s) => (sym) => parseNetIncome(s.rows[sym], sym),
    marginLast: (s) => (sym) => getLastMargin(s.rows[sym], sym)
  },
  actions: {
    async fetchAll() {
      this.loading = true;
      try {
        await Promise.all(SYMBOLS.map(async (sym) => {
          this.rows[sym] = await stockService.fetchData(`$${sym}`);
        }));
      } catch (e) { this.error = e; }
      finally { this.loading = false; }
    }
  }
});
