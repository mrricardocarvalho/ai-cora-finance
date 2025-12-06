import { FinancialConcept } from '../types';

export const INVESTING_BEGINNER_CONCEPTS: FinancialConcept[] = [
  {
    id: 'c_compound_interest',
    slug: 'compound-interest',
    title: {
      'pt-PT': 'Juros Compostos',
      'en-US': 'Compound Interest'
    },
    shortExplanation: {
      'pt-PT': 'Juros sobre juros. O seu dinheiro ganha juros, e esses juros ganham mais juros.',
      'en-US': 'Interest on interest. Your money earns interest, and that interest earns more interest.'
    },
    fullExplanation: {
      'pt-PT': 'Os juros compostos são o processo onde os juros ganhos num investimento são reinvestidos para gerar ainda mais juros. Com o tempo, isto cria um efeito de bola de neve, fazendo o seu dinheiro crescer exponencialmente em vez de linearmente. É a força mais poderosa na construção de riqueza a longo prazo.',
      'en-US': 'Compound interest is the process where interest earned on an investment is reinvested to earn even more interest. Over time, this creates a snowball effect, causing your money to grow exponentially rather than linearly. It is the most powerful force in long-term wealth building.'
    },
    example: {
      'pt-PT': 'Se investir 1.000€ com um retorno de 10% ao ano: No ano 1 ganha 100€ (total 1.100€). No ano 2 ganha 110€ (10% de 1.100€), não apenas 100€. Após 20 anos, terá 6.727€, tendo investido apenas 1.000€.',
      'en-US': 'If you invest €1,000 at 10% return per year: Year 1 you earn €100 (total €1,100). Year 2 you earn €110 (10% of €1,100), not just €100. After 20 years, you will have €6,727, having invested only €1,000.'
    },
    relatedConcepts: ['savings-rate', 'inflation-impact'],
    difficulty: 'beginner',
    category: 'investing'
  },
  {
    id: 'c_etf_basics',
    slug: 'etf-basics',
    title: {
      'pt-PT': 'O que é um ETF',
      'en-US': 'What is an ETF'
    },
    shortExplanation: {
      'pt-PT': 'Um cesto de investimentos (ações, obrigações) que se compra como uma única ação.',
      'en-US': 'A basket of investments (stocks, bonds) that you buy like a single stock.'
    },
    fullExplanation: {
      'pt-PT': 'ETF significa "Exchange Traded Fund" (Fundo Negociado em Bolsa). É um fundo que detém múltiplos ativos (como ações de 500 empresas diferentes) mas é negociado na bolsa como se fosse uma única ação. Permite diversificar o seu investimento instantaneamente com baixo custo.',
      'en-US': 'ETF stands for Exchange Traded Fund. It is a fund that holds multiple assets (like stocks of 500 different companies) but trades on the stock exchange like a single stock. It allows you to diversify your investment instantly at a low cost.'
    },
    example: {
      'pt-PT': 'Ao comprar 1 unidade de um ETF do S&P 500 (como o VUAA) por 80€, está a comprar uma pequena fração das 500 maiores empresas dos EUA (Apple, Microsoft, Amazon, etc.) de uma só vez.',
      'en-US': 'By buying 1 unit of an S&P 500 ETF (like VUAA) for €80, you are buying a small fraction of the 500 largest US companies (Apple, Microsoft, Amazon, etc.) all at once.'
    },
    relatedConcepts: ['diversification', 'dollar-cost-averaging'],
    difficulty: 'beginner',
    category: 'investing'
  },
  {
    id: 'c_diversification',
    slug: 'diversification',
    title: {
      'pt-PT': 'Diversificação',
      'en-US': 'Diversification'
    },
    shortExplanation: {
      'pt-PT': 'Não colocar todos os ovos no mesmo cesto para reduzir o risco.',
      'en-US': 'Not putting all your eggs in one basket to reduce risk.'
    },
    fullExplanation: {
      'pt-PT': 'A diversificação é a prática de espalhar os seus investimentos por diferentes tipos de ativos (ações, obrigações, imobiliário) e geografias. O objetivo é reduzir o risco: se um investimento correr mal, os outros podem compensar as perdas.',
      'en-US': 'Diversification is the practice of spreading your investments across different types of assets (stocks, bonds, real estate) and geographies. The goal is to reduce risk: if one investment performs poorly, others may balance out the losses.'
    },
    example: {
      'pt-PT': 'Em vez de investir 10.000€ apenas em ações da Tesla, investe em um ETF Mundial. Se a Tesla cair 50%, perde 5.000€. Se a Tesla cair 50% mas for apenas 1% do ETF Mundial, o seu portfólio quase não sente o impacto.',
      'en-US': 'Instead of investing €10,000 only in Tesla stock, you invest in a World ETF. If Tesla drops 50%, you lose €5,000. If Tesla drops 50% but is only 1% of the World ETF, your portfolio barely feels the impact.'
    },
    relatedConcepts: ['etf-basics', 'asset-allocation'],
    difficulty: 'beginner',
    category: 'investing'
  },
  {
    id: 'c_dollar_cost_averaging',
    slug: 'dollar-cost-averaging',
    title: {
      'pt-PT': 'Investimento Periódico (DCA)',
      'en-US': 'Dollar-Cost Averaging (DCA)'
    },
    shortExplanation: {
      'pt-PT': 'Investir a mesma quantia regularmente, independentemente do preço.',
      'en-US': 'Investing the same amount regularly, regardless of the price.'
    },
    fullExplanation: {
      'pt-PT': 'Dollar-Cost Averaging (DCA) é a estratégia de investir uma quantia fixa em intervalos regulares (ex: todos os meses), independentemente do que o mercado está a fazer. Isto remove a emoção do investimento e evita o risco de tentar "adivinhar" o melhor momento para investir.',
      'en-US': 'Dollar-Cost Averaging (DCA) is the strategy of investing a fixed amount at regular intervals (e.g., every month), regardless of what the market is doing. This removes emotion from investing and avoids the risk of trying to "time" the market.'
    },
    example: {
      'pt-PT': 'Investe 200€ todos os meses num ETF. Em Janeiro o preço é 50€ (compra 4 unidades). Em Fevereiro o preço sobe para 100€ (compra 2 unidades). Em Março cai para 25€ (compra 8 unidades). No final, comprou mais unidades quando estava barato e menos quando estava caro.',
      'en-US': 'You invest €200 every month in an ETF. In January the price is €50 (you buy 4 units). In February the price rises to €100 (you buy 2 units). In March it drops to €25 (you buy 8 units). In the end, you bought more units when it was cheap and fewer when it was expensive.'
    },
    relatedConcepts: ['etf-basics', 'savings-rate'],
    difficulty: 'beginner',
    category: 'investing'
  }
];
