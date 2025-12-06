import { analyzeSeasonality, analyzeBillTrends, analyzeSubscriptionCreep, predictCashFlow } from './pattern-recognition';
import { subMonths, addMonths, format } from 'date-fns';

describe('Predictive Pattern Recognition', () => {
  
  describe('analyzeSeasonality', () => {
    it('should detect seasonal spending spike', () => {
      const today = new Date();
      const nextMonth = addMonths(today, 1);
      const nextMonthIdx = nextMonth.getMonth();
      
      // Generate transactions: 
      // - Normal months: 1000
      // - Next month (last year): 2000
      const transactions = [];
      
      // Last 12 months
      for (let i = 0; i < 12; i++) {
        const date = subMonths(today, i);
        const isTargetMonth = date.getMonth() === nextMonthIdx;
        transactions.push({
          date: date.toISOString(),
          amount: isTargetMonth ? -2000 : -1000,
          description: 'Expense'
        });
      }

      const insights = analyzeSeasonality(transactions);
      
      // Should detect spike if next month is significantly higher
      // Global avg ~1083. Next month 2000. 2000 > 1083 * 1.2 (1300). Yes.
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0].type).toBe('seasonal');
      expect(insights[0].title).toContain('Seasonal Spending Alert');
    });

    it('should ignore normal variance', () => {
      const today = new Date();
      const transactions = [];
      for (let i = 0; i < 12; i++) {
        transactions.push({
          date: subMonths(today, i).toISOString(),
          amount: -1000,
          description: 'Expense'
        });
      }
      const insights = analyzeSeasonality(transactions);
      expect(insights.length).toBe(0);
    });
  });

  describe('analyzeBillTrends', () => {
    it('should detect bill increase', () => {
      const transactions = [];
      // 6 months of bills
      for (let i = 5; i >= 0; i--) {
        transactions.push({
          date: subMonths(new Date(), i).toISOString(),
          amount: i < 3 ? -150 : -100, // Recent 3 months higher (150 vs 100) -> 50% increase
          description: 'EDP Energy Bill',
          merchant_name: 'EDP'
        });
      }

      const insights = analyzeBillTrends(transactions);
      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe('trend');
      expect(insights[0].title).toContain('Bill Increase Detected');
    });
  });

  describe('analyzeSubscriptionCreep', () => {
    it('should detect new subscriptions', () => {
      const recurring = [
        {
          created_at: new Date().toISOString(), // Just added
          amount: -25,
          frequency: 'monthly',
          merchant_name: 'Netflix'
        }
      ];

      const insights = analyzeSubscriptionCreep(recurring);
      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe('creep');
    });

    it('should ignore old subscriptions', () => {
      const recurring = [
        {
          created_at: subMonths(new Date(), 2).toISOString(), // 2 months ago
          amount: -25,
          frequency: 'monthly',
          merchant_name: 'Netflix'
        }
      ];

      const insights = analyzeSubscriptionCreep(recurring);
      expect(insights.length).toBe(0);
    });
  });

  describe('predictCashFlow', () => {
    it('should detect declining savings rate', () => {
      const summaries = [
        { month: '2024-01', total_in: 5000, total_out: 3000 }, // 40%
        { month: '2024-02', total_in: 5000, total_out: 3500 }, // 30%
        { month: '2024-03', total_in: 5000, total_out: 4000 }, // 20%
        { month: '2024-04', total_in: 5000, total_out: 4500 }, // 10% (Declining & < 15%)
      ];

      const insights = predictCashFlow(summaries);
      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe('cashflow');
    });

    it('should ignore stable savings rate', () => {
      const summaries = [
        { month: '2024-01', total_in: 5000, total_out: 3000 },
        { month: '2024-02', total_in: 5000, total_out: 3000 },
        { month: '2024-03', total_in: 5000, total_out: 3000 },
      ];

      const insights = predictCashFlow(summaries);
      expect(insights.length).toBe(0);
    });
  });

});
