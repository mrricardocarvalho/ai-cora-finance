import { FinancialConcept } from '../types';

export const TAXES_BEGINNER_CONCEPTS: FinancialConcept[] = [
  {
    id: 'c_irs_basics',
    slug: 'irs-basics',
    title: {
      'pt-PT': 'Noções de IRS',
      'en-US': 'IRS Basics'
    },
    shortExplanation: {
      'pt-PT': 'O imposto anual sobre o rendimento das pessoas em Portugal.',
      'en-US': 'The annual tax on personal income in Portugal.'
    },
    fullExplanation: {
      'pt-PT': 'O IRS (Imposto sobre o Rendimento das Pessoas Singulares) é um imposto progressivo: quem ganha mais, paga uma percentagem maior. Todos os anos, entre Abril e Junho, deve entregar a declaração para acertar contas com o Estado (pagar o que falta ou receber o que pagou a mais).',
      'en-US': 'IRS (Personal Income Tax) is a progressive tax: those who earn more pay a higher percentage. Every year, between April and June, you must file a declaration to settle accounts with the State (pay what is missing or receive what you overpaid).'
    },
    example: {
      'pt-PT': 'Se o seu salário bruto é 20.000€/ano, o Estado retém uma parte todos os meses. Se no final do ano o imposto real for inferior ao que reteve, recebe reembolso.',
      'en-US': 'If your gross salary is €20,000/year, the State withholds a portion every month. If at the end of the year the actual tax is lower than what was withheld, you receive a refund.'
    },
    relatedConcepts: ['tax-deductions', 'e-fatura'],
    difficulty: 'beginner',
    category: 'taxes'
  },
  {
    id: 'c_capital_gains_tax',
    slug: 'capital-gains-tax',
    title: {
      'pt-PT': 'Imposto sobre Mais-Valias',
      'en-US': 'Capital Gains Tax'
    },
    shortExplanation: {
      'pt-PT': 'O imposto de 28% sobre o lucro dos seus investimentos.',
      'en-US': 'The 28% tax on the profit from your investments.'
    },
    fullExplanation: {
      'pt-PT': 'Em Portugal, quando vende um investimento (ações, fundos, imóveis) com lucro, tem de pagar imposto sobre esse lucro (a mais-valia). A taxa liberatória normal é 28%. Só paga imposto quando vende; enquanto o investimento cresce sem ser vendido, não paga nada.',
      'en-US': 'In Portugal, when you sell an investment (stocks, funds, real estate) at a profit, you must pay tax on that profit (capital gain). The standard flat rate is 28%. You only pay tax when you sell; while the investment grows without being sold, you pay nothing.'
    },
    example: {
      'pt-PT': 'Comprou ações por 1.000€ e vendeu por 1.500€. O lucro é 500€. Paga 28% de 500€ = 140€ de imposto. Fica com 360€ de lucro líquido.',
      'en-US': 'You bought stocks for €1,000 and sold for €1,500. The profit is €500. You pay 28% of €500 = €140 tax. You keep €360 net profit.'
    },
    relatedConcepts: ['tax-loss-harvesting', 'irs-basics'],
    difficulty: 'beginner',
    category: 'taxes'
  },
  {
    id: 'c_tax_deductions',
    slug: 'tax-deductions',
    title: {
      'pt-PT': 'Deduções Fiscais',
      'en-US': 'Tax Deductions'
    },
    shortExplanation: {
      'pt-PT': 'Despesas que abatem ao imposto que tem a pagar.',
      'en-US': 'Expenses that reduce the tax you have to pay.'
    },
    fullExplanation: {
      'pt-PT': 'O Estado permite-lhe descontar certas despesas do seu IRS. As categorias principais são: Despesas Gerais Familiares, Saúde, Educação, Habitação (rendas/juros antigos) e Lares. Maximizar estas deduções é a forma mais fácil de aumentar o seu reembolso.',
      'en-US': 'The State allows you to deduct certain expenses from your IRS. The main categories are: General Family Expenses, Health, Education, Housing (rent/old interest), and Nursing Homes. Maximizing these deductions is the easiest way to increase your refund.'
    },
    example: {
      'pt-PT': 'Pode deduzir 15% das despesas de saúde até 1.000€. Se gastou 200€ em consultas, o Estado "devolve-lhe" 30€ no acerto final do IRS.',
      'en-US': 'You can deduct 15% of health expenses up to €1,000. If you spent €200 on appointments, the State "gives back" €30 in the final IRS settlement.'
    },
    relatedConcepts: ['e-fatura', 'irs-basics'],
    difficulty: 'beginner',
    category: 'taxes'
  },
  {
    id: 'c_e_fatura',
    slug: 'e-fatura',
    title: {
      'pt-PT': 'e-Fatura',
      'en-US': 'e-Invoice System'
    },
    shortExplanation: {
      'pt-PT': 'O portal onde deve validar as faturas para ter direito às deduções.',
      'en-US': 'The portal where you must validate invoices to be entitled to deductions.'
    },
    fullExplanation: {
      'pt-PT': 'Pedir "fatura com contribuinte" não chega. Tem de ir ao portal e-Fatura validar se as despesas estão na categoria correta (ex: garantir que uma consulta está em "Saúde" e não "Outros"). Se não o fizer, perde centenas de euros em deduções.',
      'en-US': 'Asking for "invoice with tax ID" is not enough. You must go to the e-Fatura portal to validate if expenses are in the correct category (e.g., ensuring an appointment is in "Health" and not "Others"). If you don\'t, you lose hundreds of euros in deductions.'
    },
    example: {
      'pt-PT': 'Comprou óculos (Saúde) num supermercado. O sistema pode classificar como "Despesas Gerais". Tem de ir ao e-Fatura mudar para "Saúde" para deduzir 15% em vez de 0%.',
      'en-US': 'You bought glasses (Health) at a supermarket. The system might classify it as "General Expenses". You must go to e-Fatura and change it to "Health" to deduct 15% instead of 0%.'
    },
    relatedConcepts: ['tax-deductions', 'irs-basics'],
    difficulty: 'beginner',
    category: 'taxes'
  }
];
