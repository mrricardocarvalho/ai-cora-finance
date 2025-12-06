import { FinancialConcept } from '../types';

export const DEBT_BEGINNER_CONCEPTS: FinancialConcept[] = [
  {
    id: 'c_good_debt_bad_debt',
    slug: 'good-debt-bad-debt',
    title: {
      'pt-PT': 'Dívida Boa vs Má',
      'en-US': 'Good Debt vs Bad Debt'
    },
    shortExplanation: {
      'pt-PT': 'Dívida que o enriquece vs dívida que o empobrece.',
      'en-US': 'Debt that makes you richer vs debt that makes you poorer.'
    },
    fullExplanation: {
      'pt-PT': 'Nem toda a dívida é igual. "Dívida Boa" é usada para comprar ativos que valorizam ou geram rendimento (ex: crédito habitação, educação). "Dívida Má" é usada para comprar bens de consumo que perdem valor (ex: crédito para férias, carro novo, cartão de crédito).',
      'en-US': 'Not all debt is created equal. "Good Debt" is used to buy assets that appreciate or generate income (e.g., mortgage, education). "Bad Debt" is used to buy consumer goods that lose value (e.g., loan for vacations, new car, credit card).'
    },
    example: {
      'pt-PT': 'Um crédito habitação a 3% para comprar uma casa que valoriza é dívida boa. Um cartão de crédito a 18% para comprar roupa que vale zero no ano seguinte é dívida má.',
      'en-US': 'A mortgage at 3% to buy a house that appreciates is good debt. A credit card at 18% to buy clothes that are worth zero next year is bad debt.'
    },
    relatedConcepts: ['net-worth', 'interest-rate-apr'],
    difficulty: 'beginner',
    category: 'debt'
  },
  {
    id: 'c_interest_rate_apr',
    slug: 'interest-rate-apr',
    title: {
      'pt-PT': 'Taxa de Juro (TAEG)',
      'en-US': 'Interest Rate (APR)'
    },
    shortExplanation: {
      'pt-PT': 'O custo real de pedir dinheiro emprestado, incluindo todas as comissões.',
      'en-US': 'The true cost of borrowing money, including all fees.'
    },
    fullExplanation: {
      'pt-PT': 'A TAEG (Taxa Anual de Encargos Efetiva Global) é o número mais importante num crédito. Diferente da TAN (Taxa Anual Nominal), a TAEG inclui os juros E todos os custos extra (seguros, comissões de dossier, impostos). É a única forma justa de comparar créditos de bancos diferentes.',
      'en-US': 'The APR (Annual Percentage Rate) is the most important number in a loan. Unlike the nominal rate, the APR includes interest AND all extra costs (insurance, processing fees, taxes). It is the only fair way to compare loans from different banks.'
    },
    example: {
      'pt-PT': 'O Banco A oferece taxa de 5% mas cobra 500€ de comissões (TAEG 7%). O Banco B oferece taxa de 6% sem comissões (TAEG 6%). O Banco B é mais barato, apesar da taxa nominal ser mais alta.',
      'en-US': 'Bank A offers a 5% rate but charges €500 in fees (APR 7%). Bank B offers a 6% rate with no fees (APR 6%). Bank B is cheaper, even though the nominal rate is higher.'
    },
    relatedConcepts: ['amortization', 'compound-interest'],
    difficulty: 'beginner',
    category: 'debt'
  },
  {
    id: 'c_avalanche_vs_snowball',
    slug: 'avalanche-vs-snowball',
    title: {
      'pt-PT': 'Avalanche vs Bola de Neve',
      'en-US': 'Avalanche vs Snowball'
    },
    shortExplanation: {
      'pt-PT': 'Duas estratégias para pagar dívidas: focar na taxa mais alta (matemática) ou no saldo menor (psicologia).',
      'en-US': 'Two strategies to pay off debt: focus on highest rate (math) or smallest balance (psychology).'
    },
    fullExplanation: {
      'pt-PT': 'Na "Avalanche", paga primeiro a dívida com a taxa de juro mais alta (poupa mais dinheiro a longo prazo). Na "Bola de Neve", paga primeiro a dívida mais pequena (ganha motivação rápida ao eliminar uma dívida). Ambas funcionam, a melhor é a que o fizer não desistir.',
      'en-US': 'In "Avalanche", you pay the debt with the highest interest rate first (saves more money long-term). In "Snowball", you pay the smallest debt first (gains quick motivation by eliminating a debt). Both work; the best one is the one that keeps you from quitting.'
    },
    example: {
      'pt-PT': 'Dívida A: 1.000€ a 20%. Dívida B: 500€ a 5%. Avalanche: Paga A primeiro (juro alto). Bola de Neve: Paga B primeiro (acaba rápido).',
      'en-US': 'Debt A: €1,000 at 20%. Debt B: €500 at 5%. Avalanche: Pay A first (high interest). Snowball: Pay B first (finishes fast).'
    },
    relatedConcepts: ['interest-rate-apr', 'good-debt-bad-debt'],
    difficulty: 'beginner',
    category: 'debt'
  },
  {
    id: 'c_amortization',
    slug: 'amortization',
    title: {
      'pt-PT': 'Amortização',
      'en-US': 'Amortization'
    },
    shortExplanation: {
      'pt-PT': 'O processo de pagar uma dívida ao longo do tempo em prestações regulares.',
      'en-US': 'The process of paying off a debt over time in regular installments.'
    },
    fullExplanation: {
      'pt-PT': 'A amortização refere-se ao pagamento gradual de uma dívida. Em cada prestação, uma parte paga os juros e outra parte abate o valor em dívida (capital). No início de um empréstimo longo (como casa), paga-se quase só juros. No final, paga-se quase só capital.',
      'en-US': 'Amortization refers to the gradual repayment of a debt. In each installment, part pays the interest and part reduces the principal balance. At the beginning of a long loan (like a mortgage), you pay mostly interest. At the end, you pay mostly principal.'
    },
    example: {
      'pt-PT': 'Prestação de 500€. No mês 1: 400€ são juros, 100€ abatem a dívida. No mês 200: 50€ são juros, 450€ abatem a dívida.',
      'en-US': 'Installment of €500. Month 1: €400 is interest, €100 reduces debt. Month 200: €50 is interest, €450 reduces debt.'
    },
    relatedConcepts: ['interest-rate-apr', 'good-debt-bad-debt'],
    difficulty: 'beginner',
    category: 'debt'
  }
];
