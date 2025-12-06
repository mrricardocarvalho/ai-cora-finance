import { FinancialConcept } from '../types';

export const INVESTING_INTERMEDIATE_CONCEPTS: FinancialConcept[] = [
  {
    id: 'c_fire_movement',
    slug: 'fire-movement',
    title: {
      'pt-PT': 'Movimento FIRE',
      'en-US': 'FIRE Movement'
    },
    shortExplanation: {
      'pt-PT': 'Financial Independence, Retire Early - independência financeira para reformar-se cedo.',
      'en-US': 'Financial Independence, Retire Early - building wealth to retire before traditional age.'
    },
    fullExplanation: {
      'pt-PT': 'FIRE (Financial Independence, Retire Early) é um movimento focado em poupar e investir agressivamente (50-70% do rendimento) para atingir independência financeira décadas antes da idade tradicional de reforma. O número FIRE representa 25x as suas despesas anuais, baseado na regra dos 4%.',
      'en-US': 'FIRE (Financial Independence, Retire Early) is a movement focused on aggressive saving and investing (50-70% of income) to achieve financial independence decades before traditional retirement age. Your FIRE number represents 25x your annual expenses, based on the 4% rule.'
    },
    example: {
      'pt-PT': 'Se gasta 24.000€/ano, o seu número FIRE é 600.000€ (24.000 × 25). Ao investir 1.500€/mês com 7% de retorno anual, atinge este valor em aproximadamente 18 anos.',
      'en-US': 'If you spend €24,000/year, your FIRE number is €600,000 (24,000 × 25). By investing €1,500/month at 7% annual return, you reach this in approximately 18 years.'
    },
    relatedConcepts: ['savings-rate', 'compound-interest', 'safe-withdrawal-rate'],
    difficulty: 'intermediate',
    category: 'investing',
    formula: 'FIRE Number = Annual Expenses × 25'
  },
  {
    id: 'c_safe_withdrawal_rate',
    slug: 'safe-withdrawal-rate',
    title: {
      'pt-PT': 'Taxa de Levantamento Segura (4%)',
      'en-US': 'Safe Withdrawal Rate (4% Rule)'
    },
    shortExplanation: {
      'pt-PT': 'Pode levantar 4% do seu portfólio anualmente sem esgotar o capital.',
      'en-US': 'You can withdraw 4% of your portfolio annually without depleting your capital.'
    },
    fullExplanation: {
      'pt-PT': 'A regra dos 4% sugere que pode levantar 4% do seu portfólio de investimentos no primeiro ano de reforma, ajustando pela inflação nos anos seguintes, e o dinheiro durará pelo menos 30 anos. Esta regra vem do estudo Trinity e assume uma carteira diversificada de ações e obrigações.',
      'en-US': 'The 4% rule suggests you can withdraw 4% of your investment portfolio in your first retirement year, adjusting for inflation in subsequent years, and your money will last at least 30 years. This rule comes from the Trinity Study and assumes a diversified portfolio of stocks and bonds.'
    },
    example: {
      'pt-PT': 'Com 500.000€ investidos, pode levantar 20.000€/ano (4%). Se a inflação for 2%, no ano seguinte levanta 20.400€, mantendo o poder de compra real.',
      'en-US': 'With €500,000 invested, you can withdraw €20,000/year (4%). If inflation is 2%, the next year you withdraw €20,400, maintaining real purchasing power.'
    },
    relatedConcepts: ['fire-movement', 'inflation-impact'],
    difficulty: 'intermediate',
    category: 'investing',
    formula: 'Annual Withdrawal = Portfolio × 0.04'
  },
  {
    id: 'c_tax_loss_harvesting',
    slug: 'tax-loss-harvesting',
    title: {
      'pt-PT': 'Colheita de Prejuízos Fiscais',
      'en-US': 'Tax-Loss Harvesting'
    },
    shortExplanation: {
      'pt-PT': 'Vender investimentos com perdas para compensar ganhos e reduzir impostos.',
      'en-US': 'Selling investments at a loss to offset gains and reduce taxes.'
    },
    fullExplanation: {
      'pt-PT': 'Tax-loss harvesting é a estratégia de vender investimentos que estão em prejuízo para realizar perdas fiscais que podem compensar ganhos de capital noutros investimentos. Em Portugal, as mais-valias são tributadas a 28% (ou englobamento), e os prejuízos podem ser reportados por 5 anos.',
      'en-US': 'Tax-loss harvesting is the strategy of selling investments that are at a loss to realize tax losses that can offset capital gains from other investments. In Portugal, capital gains are taxed at 28% (or progressive rates), and losses can be carried forward for 5 years.'
    },
    example: {
      'pt-PT': 'Vendeu ações da empresa A com 5.000€ de ganho (imposto: 1.400€). Mas tem ações B com 3.000€ de prejuízo. Ao vender B, reduz o ganho tributável para 2.000€, pagando apenas 560€ de imposto.',
      'en-US': 'You sold Company A shares with €5,000 gain (tax: €1,400). But you have Company B shares with €3,000 loss. By selling B, you reduce taxable gain to €2,000, paying only €560 in tax.'
    },
    relatedConcepts: ['capital-gains-tax', 'portfolio-rebalancing'],
    difficulty: 'intermediate',
    category: 'investing'
  },
  {
    id: 'c_asset_allocation',
    slug: 'asset-allocation',
    title: {
      'pt-PT': 'Alocação de Ativos',
      'en-US': 'Asset Allocation'
    },
    shortExplanation: {
      'pt-PT': 'Como dividir o seu dinheiro entre diferentes tipos de investimentos.',
      'en-US': 'How to divide your money between different types of investments.'
    },
    fullExplanation: {
      'pt-PT': 'Alocação de ativos é a estratégia de distribuir os seus investimentos entre diferentes classes de ativos (ações, obrigações, imobiliário, dinheiro) com base no seu perfil de risco, idade e objetivos. Uma regra comum é "110 - idade" para a percentagem em ações.',
      'en-US': 'Asset allocation is the strategy of distributing your investments across different asset classes (stocks, bonds, real estate, cash) based on your risk profile, age, and goals. A common rule is "110 - age" for the percentage in stocks.'
    },
    example: {
      'pt-PT': 'Aos 30 anos: 110 - 30 = 80% em ações, 20% em obrigações. Aos 50 anos: 110 - 50 = 60% em ações, 40% em obrigações. À medida que envelhece, reduz o risco.',
      'en-US': 'At age 30: 110 - 30 = 80% in stocks, 20% in bonds. At age 50: 110 - 50 = 60% in stocks, 40% in bonds. As you age, you reduce risk.'
    },
    relatedConcepts: ['diversification', 'portfolio-rebalancing', 'risk-tolerance'],
    difficulty: 'intermediate',
    category: 'investing',
    formula: 'Stock % = 110 - Your Age'
  },
  {
    id: 'c_coast_fire',
    slug: 'coast-fire',
    title: {
      'pt-PT': 'Coast FIRE',
      'en-US': 'Coast FIRE'
    },
    shortExplanation: {
      'pt-PT': 'Já investiu o suficiente para a reforma - agora só precisa de cobrir despesas atuais.',
      'en-US': 'Already invested enough for retirement - now just need to cover current expenses.'
    },
    fullExplanation: {
      'pt-PT': 'Coast FIRE é o ponto em que já acumulou investimentos suficientes que, com os juros compostos, crescerão até ao seu número FIRE sem contribuições adicionais. A partir deste ponto, só precisa de ganhar o suficiente para despesas correntes, sem necessidade de poupar mais.',
      'en-US': 'Coast FIRE is the point where you have accumulated enough investments that, with compound interest, will grow to your FIRE number without additional contributions. From this point, you only need to earn enough for current expenses, without needing to save more.'
    },
    example: {
      'pt-PT': 'Aos 35 anos tem 150.000€ investidos. Com 7% de retorno anual, em 25 anos terá 813.000€ - suficiente para a reforma tradicional. Pode trabalhar menos ou mudar para um trabalho que paga menos mas é mais gratificante.',
      'en-US': 'At 35, you have €150,000 invested. At 7% annual return, in 25 years you will have €813,000 - enough for traditional retirement. You can work less or switch to a lower-paying but more fulfilling job.'
    },
    relatedConcepts: ['fire-movement', 'compound-interest', 'safe-withdrawal-rate'],
    difficulty: 'intermediate',
    category: 'investing',
    formula: 'Coast FIRE = Target FIRE Number ÷ (1.07^Years to Retirement)'
  }
];
