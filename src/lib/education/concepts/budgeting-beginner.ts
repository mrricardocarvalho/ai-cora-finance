import { FinancialConcept } from '../types';

export const BUDGETING_BEGINNER_CONCEPTS: FinancialConcept[] = [
  {
    id: 'c_emergency_fund',
    slug: 'emergency-fund',
    title: {
      'pt-PT': 'Fundo de Emergência',
      'en-US': 'Emergency Fund'
    },
    shortExplanation: {
      'pt-PT': 'Dinheiro guardado exclusivamente para despesas inesperadas e urgentes.',
      'en-US': 'Money set aside exclusively for unexpected and urgent expenses.'
    },
    fullExplanation: {
      'pt-PT': 'Um fundo de emergência é uma reserva financeira destinada a cobrir imprevistos como desemprego, avarias no carro ou despesas médicas. Evita que tenha de recorrer a dívidas (cartões de crédito) quando algo corre mal. Deve cobrir 3 a 6 meses das suas despesas essenciais.',
      'en-US': 'An emergency fund is a financial reserve designed to cover unforeseen events like unemployment, car breakdowns, or medical expenses. It prevents you from having to rely on debt (credit cards) when something goes wrong. It should cover 3 to 6 months of your essential expenses.'
    },
    example: {
      'pt-PT': 'Se as suas despesas mensais essenciais são 1.000€, o seu fundo de emergência deve ter entre 3.000€ e 6.000€ numa conta poupança de fácil acesso.',
      'en-US': 'If your essential monthly expenses are €1,000, your emergency fund should have between €3,000 and €6,000 in an easily accessible savings account.'
    },
    relatedConcepts: ['good-debt-bad-debt', 'savings-rate'],
    difficulty: 'beginner',
    category: 'budgeting'
  },
  {
    id: 'c_50_30_20_rule',
    slug: '50-30-20-rule',
    title: {
      'pt-PT': 'Regra 50/30/20',
      'en-US': '50/30/20 Rule'
    },
    shortExplanation: {
      'pt-PT': 'Um método simples de orçamentação: 50% Necessidades, 30% Desejos, 20% Poupança.',
      'en-US': 'A simple budgeting method: 50% Needs, 30% Wants, 20% Savings.'
    },
    fullExplanation: {
      'pt-PT': 'A regra 50/30/20 divide o seu rendimento líquido em três categorias: 50% para necessidades (casa, comida, luz), 30% para desejos (jantares, hobbies, subscrições) e 20% para poupança e pagamento de dívidas. É um excelente ponto de partida para organizar as finanças.',
      'en-US': 'The 50/30/20 rule divides your net income into three categories: 50% for needs (housing, food, utilities), 30% for wants (dining out, hobbies, subscriptions), and 20% for savings and debt repayment. It is an excellent starting point for organizing finances.'
    },
    example: {
      'pt-PT': 'Se ganha 1.000€ líquidos: Gaste no máximo 500€ em contas e supermercado. Use 300€ para lazer e compras. Guarde obrigatoriamente 200€ para o futuro.',
      'en-US': 'If you earn €1,000 net: Spend at most €500 on bills and groceries. Use €300 for leisure and shopping. Mandatorily save €200 for the future.'
    },
    relatedConcepts: ['savings-rate', 'emergency-fund'],
    difficulty: 'beginner',
    category: 'budgeting'
  },
  {
    id: 'c_savings_rate',
    slug: 'savings-rate',
    title: {
      'pt-PT': 'Taxa de Poupança',
      'en-US': 'Savings Rate'
    },
    shortExplanation: {
      'pt-PT': 'A percentagem do seu rendimento que consegue guardar todos os meses.',
      'en-US': 'The percentage of your income that you manage to save every month.'
    },
    fullExplanation: {
      'pt-PT': 'A taxa de poupança é o indicador mais importante da sua saúde financeira. É calculada dividindo o valor poupado pelo rendimento total. Quanto maior a taxa, mais rápido atingirá a liberdade financeira, independentemente de quanto ganha.',
      'en-US': 'The savings rate is the most important indicator of your financial health. It is calculated by dividing the amount saved by total income. The higher the rate, the faster you will reach financial freedom, regardless of how much you earn.'
    },
    example: {
      'pt-PT': 'Se ganha 1.500€ e gasta 1.200€, poupa 300€. A sua taxa de poupança é 20% (300 ÷ 1500). Aumentar esta taxa é mais eficaz do que procurar melhores retornos de investimento.',
      'en-US': 'If you earn €1,500 and spend €1,200, you save €300. Your savings rate is 20% (300 ÷ 1500). Increasing this rate is more effective than seeking better investment returns.'
    },
    relatedConcepts: ['fire', '50-30-20-rule'],
    difficulty: 'beginner',
    category: 'budgeting'
  },
  {
    id: 'c_net_worth',
    slug: 'net-worth',
    title: {
      'pt-PT': 'Património Líquido',
      'en-US': 'Net Worth'
    },
    shortExplanation: {
      'pt-PT': 'O valor total de tudo o que tem menos tudo o que deve.',
      'en-US': 'The total value of everything you own minus everything you owe.'
    },
    fullExplanation: {
      'pt-PT': 'O Património Líquido é a "fotografia" da sua riqueza num dado momento. Calcula-se somando todos os Ativos (dinheiro, investimentos, casa, carro) e subtraindo todos os Passivos (crédito habitação, crédito pessoal, cartões). Se o resultado for positivo, tem mais do que deve.',
      'en-US': 'Net Worth is the "snapshot" of your wealth at a given moment. It is calculated by summing all Assets (cash, investments, house, car) and subtracting all Liabilities (mortgage, personal loans, credit cards). If the result is positive, you own more than you owe.'
    },
    example: {
      'pt-PT': 'Ativos: Casa (200k) + Investimentos (20k) = 220k. Passivos: Empréstimo Casa (150k) + Carro (10k) = 160k. Património Líquido = 220k - 160k = 60.000€.',
      'en-US': 'Assets: House (200k) + Investments (20k) = 220k. Liabilities: Mortgage (150k) + Car (10k) = 160k. Net Worth = 220k - 160k = €60,000.'
    },
    relatedConcepts: ['good-debt-bad-debt', 'fire'],
    difficulty: 'beginner',
    category: 'budgeting'
  }
];
