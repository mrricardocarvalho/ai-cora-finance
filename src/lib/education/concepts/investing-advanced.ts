import { FinancialConcept } from '../types';

export const INVESTING_ADVANCED_CONCEPTS: FinancialConcept[] = [
  {
    id: 'c_portfolio_rebalancing',
    slug: 'portfolio-rebalancing',
    title: {
      'pt-PT': 'Reequilíbrio de Portfólio',
      'en-US': 'Portfolio Rebalancing'
    },
    shortExplanation: {
      'pt-PT': 'Ajustar periodicamente os seus investimentos para manter a alocação desejada.',
      'en-US': 'Periodically adjusting your investments to maintain your desired allocation.'
    },
    fullExplanation: {
      'pt-PT': 'Reequilíbrio é o processo de realinhar a composição do seu portfólio com a alocação alvo. Se definiu 80% ações e 20% obrigações, mas as ações subiram e agora representam 90%, vende ações e compra obrigações para voltar a 80/20. Isto mantém o nível de risco desejado e força a vender caro e comprar barato.',
      'en-US': 'Rebalancing is the process of realigning your portfolio composition with your target allocation. If you set 80% stocks and 20% bonds, but stocks rose and now represent 90%, you sell stocks and buy bonds to return to 80/20. This maintains your desired risk level and forces you to sell high and buy low.'
    },
    example: {
      'pt-PT': 'Portfólio de 100.000€: 80.000€ em ações, 20.000€ em obrigações. Após um ano, ações valem 100.000€, obrigações 22.000€. Novo total: 122.000€. Alvo 80/20 = 97.600€/24.400€. Vende 2.400€ de ações e compra obrigações.',
      'en-US': 'Portfolio of €100,000: €80,000 in stocks, €20,000 in bonds. After one year, stocks worth €100,000, bonds €22,000. New total: €122,000. Target 80/20 = €97,600/€24,400. Sell €2,400 of stocks and buy bonds.'
    },
    relatedConcepts: ['asset-allocation', 'tax-loss-harvesting', 'diversification'],
    difficulty: 'advanced',
    category: 'investing',
    visualType: 'chart'
  },
  {
    id: 'c_tax_efficient_investing',
    slug: 'tax-efficient-investing',
    title: {
      'pt-PT': 'Investimento Eficiente em Impostos',
      'en-US': 'Tax-Efficient Investing'
    },
    shortExplanation: {
      'pt-PT': 'Estratégias para minimizar impostos sobre ganhos de investimento.',
      'en-US': 'Strategies to minimize taxes on investment gains.'
    },
    fullExplanation: {
      'pt-PT': 'Investimento eficiente em impostos envolve estratégias como: usar ETFs acumulativos (que não distribuem dividendos tributáveis), manter investimentos por mais tempo (menos eventos tributáveis), aproveitar a isenção de PPR (20% até 2.000€ de dedução), e usar contas de reforma quando disponíveis. Em Portugal, pode também escolher entre tributação autónoma (28%) ou englobamento.',
      'en-US': 'Tax-efficient investing involves strategies like: using accumulating ETFs (which don\'t distribute taxable dividends), holding investments longer (fewer taxable events), leveraging PPR tax deduction (20% up to €2,000 deduction), and using retirement accounts when available. In Portugal, you can also choose between autonomous taxation (28%) or progressive rates.'
    },
    example: {
      'pt-PT': 'ETF Distributivo: Recebe 1.000€ de dividendos, paga 280€ de imposto imediatamente. ETF Acumulativo: Os dividendos são reinvestidos internamente, não paga imposto até vender. Após 20 anos, a diferença pode ser significativa devido aos juros compostos.',
      'en-US': 'Distributing ETF: Receive €1,000 in dividends, pay €280 tax immediately. Accumulating ETF: Dividends are reinvested internally, no tax until you sell. After 20 years, the difference can be significant due to compound interest.'
    },
    relatedConcepts: ['tax-loss-harvesting', 'capital-gains-tax', 'ppr-retirement'],
    difficulty: 'advanced',
    category: 'investing'
  },
  {
    id: 'c_sequence_of_returns_risk',
    slug: 'sequence-of-returns-risk',
    title: {
      'pt-PT': 'Risco de Sequência de Retornos',
      'en-US': 'Sequence of Returns Risk'
    },
    shortExplanation: {
      'pt-PT': 'A ordem dos retornos importa, especialmente no início da reforma.',
      'en-US': 'The order of returns matters, especially at the start of retirement.'
    },
    fullExplanation: {
      'pt-PT': 'O risco de sequência de retornos refere-se ao perigo de sofrer retornos negativos no início da reforma, quando está a fazer levantamentos. Se o mercado cair 30% no primeiro ano de reforma e levantar 4%, reduz drasticamente a longevidade do portfólio. Por isso, é prudente ter 2-3 anos de despesas em ativos estáveis.',
      'en-US': 'Sequence of returns risk refers to the danger of experiencing negative returns at the start of retirement when you are making withdrawals. If the market drops 30% in your first retirement year and you withdraw 4%, you drastically reduce portfolio longevity. Therefore, it is prudent to have 2-3 years of expenses in stable assets.'
    },
    example: {
      'pt-PT': 'Dois reformados com 500.000€, ambos com média de 7% ao ano durante 20 anos. Reformado A tem +20% no ano 1, -20% no ano 2. Reformado B tem -20% no ano 1, +20% no ano 2. Após 20 anos de levantar 20.000€/ano, A tem 600.000€ e B tem apenas 200.000€.',
      'en-US': 'Two retirees with €500,000, both averaging 7% per year over 20 years. Retiree A has +20% in year 1, -20% in year 2. Retiree B has -20% in year 1, +20% in year 2. After 20 years of withdrawing €20,000/year, A has €600,000 and B has only €200,000.'
    },
    relatedConcepts: ['safe-withdrawal-rate', 'asset-allocation', 'portfolio-rebalancing'],
    difficulty: 'advanced',
    category: 'investing',
    visualType: 'chart'
  },
  {
    id: 'c_factor_investing',
    slug: 'factor-investing',
    title: {
      'pt-PT': 'Investimento em Fatores',
      'en-US': 'Factor Investing'
    },
    shortExplanation: {
      'pt-PT': 'Estratégias que visam características específicas que historicamente geraram retornos superiores.',
      'en-US': 'Strategies targeting specific characteristics that historically generated higher returns.'
    },
    fullExplanation: {
      'pt-PT': 'Investimento em fatores é uma abordagem que visa certas características (fatores) que historicamente proporcionaram retornos superiores ao mercado. Os principais fatores são: Value (ações subvalorizadas), Size (empresas pequenas), Momentum (ações em tendência de alta), Quality (empresas com balanços fortes), e Low Volatility (ações estáveis).',
      'en-US': 'Factor investing is an approach that targets certain characteristics (factors) that have historically provided market-beating returns. The main factors are: Value (undervalued stocks), Size (small companies), Momentum (trending stocks), Quality (companies with strong balance sheets), and Low Volatility (stable stocks).'
    },
    example: {
      'pt-PT': 'Em vez de comprar apenas um ETF do S&P 500, pode adicionar um ETF Small-Cap Value como ZPRV que combina os fatores Size e Value. Historicamente, small-cap value superou o mercado geral em 2-3% ao ano.',
      'en-US': 'Instead of just buying an S&P 500 ETF, you can add a Small-Cap Value ETF like ZPRV that combines Size and Value factors. Historically, small-cap value has outperformed the broader market by 2-3% per year.'
    },
    relatedConcepts: ['diversification', 'etf-basics', 'asset-allocation'],
    difficulty: 'advanced',
    category: 'investing'
  },
  {
    id: 'c_withdrawal_strategies',
    slug: 'withdrawal-strategies',
    title: {
      'pt-PT': 'Estratégias de Levantamento na Reforma',
      'en-US': 'Retirement Withdrawal Strategies'
    },
    shortExplanation: {
      'pt-PT': 'Métodos otimizados para levantar dinheiro dos investimentos na reforma.',
      'en-US': 'Optimized methods for withdrawing money from investments in retirement.'
    },
    fullExplanation: {
      'pt-PT': 'Além da regra dos 4%, existem estratégias mais sofisticadas: Variable Percentage Withdrawal (VPW) ajusta a taxa conforme a idade e performance do mercado. Guardrails aumenta/diminui gastos com base em limites. Bucket Strategy divide ativos em curto/médio/longo prazo para estabilidade.',
      'en-US': 'Beyond the 4% rule, there are more sophisticated strategies: Variable Percentage Withdrawal (VPW) adjusts the rate based on age and market performance. Guardrails increases/decreases spending based on thresholds. Bucket Strategy divides assets into short/medium/long-term for stability.'
    },
    example: {
      'pt-PT': 'Bucket Strategy: Bucket 1 (2 anos de despesas em dinheiro), Bucket 2 (5 anos em obrigações), Bucket 3 (resto em ações). Se o mercado cair, usa Bucket 1-2 enquanto espera recuperação, protegendo Bucket 3.',
      'en-US': 'Bucket Strategy: Bucket 1 (2 years expenses in cash), Bucket 2 (5 years in bonds), Bucket 3 (rest in stocks). If the market drops, use Buckets 1-2 while waiting for recovery, protecting Bucket 3.'
    },
    relatedConcepts: ['safe-withdrawal-rate', 'sequence-of-returns-risk', 'fire-movement'],
    difficulty: 'advanced',
    category: 'investing',
    visualType: 'diagram'
  }
];
