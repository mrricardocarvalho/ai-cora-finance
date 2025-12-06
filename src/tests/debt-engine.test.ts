import simulateStrategy from '../lib/planning/debt'

// Simple smoke tests — run manually if you have a test harness later
async function run(){
  // small test: two debts
  const debts = [
    { id: 'd1', name: 'Small', balance: 1000, interest_rate: 5, min_payment: 25 },
    { id: 'd2', name: 'Large', balance: 10000, interest_rate: 20, min_payment: 200 }
  ]
  const av = simulateStrategy(debts, 100, 'avalanche')
  const sn = simulateStrategy(debts, 100, 'snowball')
  console.log('Small/Big test - Avalanche interest', av.totalInterestPaid, 'Snowball interest', sn.totalInterestPaid)
}

if(require.main === module) run()
