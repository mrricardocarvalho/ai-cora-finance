// Supported locales
export type Locale = 'pt-PT' | 'en-US'

// Translation structure type
export interface TranslationKeys {
  settings: {
    title: string
    notifications: string
    notificationsDesc: string
    data: string
    dataDesc: string
    language: string
    languageDesc: string
  }
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    close: string
    loading: string
    error: string
    success: string
    confirm: string
    back: string
    next: string
    previous: string
    search: string
    noResults: string
    required: string
    optional: string
    you: string
    privacy: string
  }
  nav: {
    home: string
    chat: string
    dashboard: string
    data: string
    portfolio: string
    planning: string
    settings: string
    goals: string
    learn: string
  }
  header: {
    available: string
    userMenu: string
    logout: string
  }
  languages: {
    'pt-PT': string
    'en-US': string
  }
  accounts: {
    title: string
    addAccount: string
    addFirst: string
    noAccounts: string
    recalculate: string
    name: string
    institution: string
    type: string
    balance: string
    interestRate: string
    minPayment: string
    dueDate: string
    visibility: string
    visibilities: {
      personal: string
      shared: string
    }
    types: {
      checking: string
      savings: string
      credit_card: string
      loan: string
      broker: string
    }
    created: string
    updated: string
    deleted: string
    confirmDelete: string
    deleteWarning: string
  }
  transactions: {
    title: string
    date: string
    description: string
    category: string
    amount: string
    account: string
    confidence: string
    actions: string
    details: string
    review: string
    ok: string
    selectAll: string
    bulkEdit: string
    noTransactions: string
    addTransaction: string
    adding: string
    addFailed: string
    showing: string
    of: string
    page: string
    previous: string
    next: string
    selected: string
    selectAllAcross: string
    noDescription: string
    noCategory: string
    unknownAccount: string
    aiConfidence: string
    recurring: string
    type: string
    expense: string
    income: string
    selectAccount: string
    fillRequired: string
    validAmount: string
    addSuccess: string
    yes: string
    no: string
  }
  upload: {
    title: string
    dropzone: string
    processing: string
    success: string
    error: string
    chooseFile: string
    noFileSelected: string
    fileReady: string
    processingMethod: string
    autoMethod: string
    regexMethod: string
    aiMethod: string
    aiModel: string
    targetAccount: string
    autoDetect: string
    importTransactions: string
    preview: string
    importing: string
    offline: string
    extracted: string
    moeyDetected: string
    imported: string
    via: string
    accountBreakdown: string
    multiAccountProcessed: string
    onlyPdf: string
    fileTooLarge: string
    importNow: string
  }
  privacy: {
    checking: string
    encrypted: string
    checkSecurity: string
    region: string
    unknownRegion: string
  }
  install: {
    installCora: string
    iosInstructions: string
  }
  dashboard: {
    title: string
    safeToSpend: string
    healthScore: string
    savingsRate: string
    income: string
    expenses: string
    netWorth: string
    monthlyTrend: string
  }
  widgets: {
    safeToSpend: {
      title: string
      details: string
      viewDetails: string
      updated: string
      liquidAssets: string
      comfortFloor: string
      pendingBills: string
      total: string
      setComfortFloor: string
      goToSettings: string
    }
    healthScore: {
      title: string
      excellent: string
      good: string
      fair: string
      poor: string
      vsMonth: string
      showDetails: string
      hideDetails: string
    }
    overview: {
      title: string
      investments: string
      noInvestments: string
      goals: string
      debts: string
      noGoals: string
      noDebts: string
      onTrack: string
      totalProgress: string
      monthMin: string
    }
    forecast: {
      title: string
      comfortFloor: string
      highConfidence: string
      mediumConfidence: string
      lowConfidence: string
      daysUntilFloor: string
      currentBalance: string
      projected30Days: string
    }
  }
  insights: {
    title: string
    noInsights: string
    dismiss: string
    act: string
    view: string
    urgent: string
    warning: string
    opportunity: string
    info: string
    tax: string
    allCaughtUp: string
    noInsightsAtThisTime: string
    taxAdvice: string
    viewMore: string
    viewAll: string
    dismissFailed: string
    actFailed: string
    healthScoreBonus: string
  }
  portfolio: {
    title: string
    totalValue: string
    dayChange: string
    totalReturn: string
    allocation: string
    holdings: string
    addInvestment: string
    taxExposure: string
    refreshPrices: string
    ticker: string
    name: string
    quantity: string
    price: string
    value: string
    return: string
    plPercent: string
    shares: string
    avgCost: string
    current: string
    sell: string
    sellShares: string
    selling: string
    confirmSell: string
    account: string
    selectAccount: string
    pricePerShare: string
    fees: string
    saleTotal: string
    transactionHistory: string
    loadingHistory: string
    noTransactions: string
    invalidQuantity: string
    invalidPrice: string
    soldSuccess: string
    sellFailed: string
    detailsOf: string
    insufficientShares: string
    selectInvestmentAccount: string
    buy: string
    dividend: string
    total: string
    investmentAdded: string
    noData: string
    realized: string
    unrealized: string
    showBreakdown: string
    hideBreakdown: string
    estimated: string
  }
  planning: {
    title: string
    goals: string
    goalsDesc: string
    debt: string
    debtDesc: string
    fire: string
    fireDesc: string
    emergencyFund: string
    addGoal: string
    targetAmount: string
    currentAmount: string
    deadline: string
    onTrack: string
    behind: string
    goalName: string
    linkedAccount: string
    none: string
    amountSyncNote: string
    saving: string
    create: string
    goalCreated: string
    addDebt: string
    debtName: string
    debtType: string
    balance: string
    youOwe: string
    interestRate: string
    interestRateNote: string
    minPayment: string
    dueDay: string
    adding: string
    fillNameBalance: string
    invalidBalance: string
    dbConnectionFailed: string
    pleaseLogin: string
    debtAdded: string
    addDebtFailed: string
    creditCard: string
    personalLoan: string
    mortgage: string
    autoLoan: string
    studentLoan: string
    fireProjection: string
    currentNetWorth: string
    fiTarget: string
    monthlySavings: string
    withdrawalRate: string
    estimatedMonthlyExpense: string
    yearsToFI: string
    retirementDate: string
    annualSavings: string
    impact: string
    savingExtra: string
    bringsRetirement: string
    delaysRetirement: string
    years: string
    runway: string
    basedOnAvgSpend: string
    target: string
    months: string
    calculating: string
    estimateMonthlySpend: string
    loanCalculator: {
      title: string
      subtitle: string
      addScenario: string
      amount: string
      rate: string
      months: string
      fees: string
      comparison: string
      schedule: string
      monthlyPayment: string
      totalInterest: string
      totalCost: string
      effectiveAPR: string
      bestValue: string
      recommendation: string
      saveText: string
    }
  }
  chat: {
    placeholder: string
    send: string
    thinking: string
    newConversation: string
    conversations: string
    greeting: string
    greetingSubtitle: string
    askAnything: string
    orAskAnything: string
    hereIsWhatIFound: string
    starterQuestions: string[]
    disclaimer: string
    listening: string
    startListening: string
    stopListening: string
  }
  pages: {
    home: {
      greeting: string
      subtitle: string
      insightHistory: string
      noInsightsYet: string
      goToData: string
      viewDetails: string
      recentInsights: string
    }
    dashboard: {
      title: string
      subtitle: string
      overview: string
      recentInsights: string
      thisMonthSpending: string
    }
    data: {
      title: string
      subtitle: string
    }
    portfolio: {
      title: string
      subtitle: string
      noHoldings: string
      noHoldingsDesc: string
      startInvesting: string
      loginRequired: string
      loadError: string
    }
    planning: {
      title: string
      subtitle: string
      goalsCard: string
      goalsCardDesc: string
      debtCard: string
      debtCardDesc: string
      fireProjection: string
    }
    goals: {
      title: string
      addGoal: string
      noGoals: string
      noGoalsTitle: string
      noGoalsDesc: string
      createFirst: string
      newGoal: string
    }
    debt: {
      title: string
      subtitle: string
      subtitleWithData: string
      addDebt: string
      noDebt: string
      noDebtTitle: string
      noDebtDesc: string
      addFirst: string
    }
    tax: {
      title: string
      subtitle: string
      deadlines: string
      deductions: string
      checklist: string
      calendar: string
      noDeadlines: string
      markDone: string
      dismiss: string
      daysLeft: string
      today: string
      tomorrow: string
      deductible: string
      estimatedBenefit: string
      nifReminder: string
      disclaimer: string
      usefulInfo: string
      askCora: string
      taxYear: string
    }
  }
}

export const translations: Record<Locale, TranslationKeys> = {
  'pt-PT': {
    // Settings
    settings: {
      title: 'Definições',
      notifications: 'Notificações',
      notificationsDesc: 'Gere preferências de notificações push',
      data: 'Dados e Privacidade',
      dataDesc: 'Gere os teus dados e definições de privacidade',
      language: 'Idioma',
      languageDesc: 'Escolhe o idioma da aplicação',
    },
    // Common
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Adicionar',
      close: 'Fechar',
      loading: 'A carregar...',
      error: 'Erro',
      success: 'Sucesso',
      confirm: 'Confirmar',
      back: 'Voltar',
      next: 'Seguinte',
      previous: 'Anterior',
      search: 'Pesquisar',
      noResults: 'Sem resultados',
      required: 'Obrigatório',
      optional: 'Opcional',
      you: 'Tu',
      privacy: 'Privacidade',
    },
    // Navigation
    nav: {
      home: 'Início',
      chat: 'Falar com Cora',
      dashboard: 'Painel',
      data: 'Dados',
      portfolio: 'Portfólio',
      planning: 'Planeamento',
      settings: 'Definições',
      goals: 'Objetivos',
      learn: 'Aprender',
    },
    // Header
    header: {
      available: 'Disponível',
      userMenu: 'Menu do utilizador',
      logout: 'Terminar Sessão',
    },
    // Language names
    languages: {
      'pt-PT': 'Português (Portugal)',
      'en-US': 'English (US)',
    },
    // Accounts
    accounts: {
      title: 'Contas',
      addAccount: 'Adicionar Conta',
      addFirst: 'Adicionar a primeira conta',
      noAccounts: 'Ainda sem contas',
      recalculate: 'Recalcular saldos',
      name: 'Nome',
      institution: 'Instituição',
      type: 'Tipo',
      balance: 'Saldo',
      interestRate: 'Taxa de Juro (TAE %)',
      minPayment: 'Pagamento Mínimo',
      dueDate: 'Dia de Vencimento (1-31)',
      visibility: 'Visibilidade',
      visibilities: {
        personal: 'Pessoal (Só eu)',
        shared: 'Partilhada (Agregado)',
      },
      types: {
        checking: 'Conta à Ordem',
        savings: 'Conta Poupança',
        credit_card: 'Cartão de Crédito',
        loan: 'Empréstimo',
        broker: 'Investimentos',
      },
      created: 'Conta criada',
      updated: 'Conta atualizada',
      deleted: 'Conta eliminada',
      confirmDelete: 'Confirmar eliminação',
      deleteWarning: 'Esta ação não pode ser desfeita. Todas as transações associadas serão também eliminadas.',
    },
    // Transactions
    transactions: {
      title: 'Transações',
      date: 'Data',
      description: 'Descrição',
      category: 'Categoria',
      amount: 'Valor',
      account: 'Conta',
      confidence: 'Confiança',
      actions: 'Ações',
      details: 'Detalhes',
      review: 'Rever',
      ok: 'OK',
      selectAll: 'Selecionar tudo',
      bulkEdit: 'Editar selecionados',
      noTransactions: 'Ainda sem transações',
      addTransaction: 'Adicionar Transação',
      adding: 'A adicionar...',
      addFailed: 'Falha ao adicionar transação',
      showing: 'A mostrar',
      of: 'de',
      page: 'Página',
      previous: 'Anterior',
      next: 'Seguinte',
      selected: 'Selecionadas',
      selectAllAcross: 'Selecionar todas as',
      noDescription: 'Sem descrição',
      noCategory: 'Sem categoria',
      unknownAccount: 'Desconhecida',
      aiConfidence: 'Confiança IA',
      recurring: 'Recorrente',
      yes: 'Sim',
      no: 'Não',
      type: 'Tipo',
      expense: 'Despesa',
      income: 'Receita',
      selectAccount: 'Selecionar conta...',
      fillRequired: 'Por favor preencha todos os campos obrigatórios',
      validAmount: 'Por favor introduza um montante válido',
      addSuccess: 'Transação adicionada com sucesso',
    },
    // Upload
    upload: {
      title: 'Importar Extrato',
      dropzone: 'Arrasta um PDF ou clica para selecionar',
      processing: 'A processar...',
      success: 'Importação concluída',
      error: 'Erro na importação',
      chooseFile: 'Escolher Ficheiro',
      noFileSelected: 'Nenhum ficheiro selecionado',
      fileReady: 'Ficheiro pronto',
      processingMethod: 'Método de Processamento',
      autoMethod: 'Auto (Moey → Regex, Outros → IA)',
      regexMethod: 'Regex (Rápido, só Moey, sem IA)',
      aiMethod: 'IA (OpenRouter, qualquer banco)',
      aiModel: 'Modelo IA (fallback)',
      targetAccount: 'Conta Destino (opcional)',
      autoDetect: 'Auto-detetar do PDF',
      importTransactions: 'Importar Transações',
      preview: 'Pré-visualizar',
      importing: 'A importar...',
      offline: 'Offline: Carregamento desativado até a ligação ser restaurada.',
      extracted: 'Extraídos',
      moeyDetected: 'Extrato Moey detetado - Parser Regex disponível',
      imported: 'Importadas',
      via: 'via',
      accountBreakdown: 'Divisão por conta',
      multiAccountProcessed: 'PDF multi-conta processado',
      onlyPdf: 'Apenas ficheiros PDF são aceites',
      fileTooLarge: 'Ficheiro demasiado grande (máx 5MB)',
      importNow: 'Importar Transações Agora',
    },
    // Privacy
    privacy: {
      checking: 'A verificar segurança...',
      encrypted: 'Encriptado',
      checkSecurity: 'Verificar Segurança',
      region: 'Região',
      unknownRegion: 'Região desconhecida',
    },
    // Install
    install: {
      installCora: 'Instalar Cora',
      iosInstructions: 'Para instalar no iOS: toca em Partilhar → Adicionar ao Ecrã Inicial.',
    },
    // Dashboard
    dashboard: {
      title: 'Painel',
      safeToSpend: 'Disponível para gastar',
      healthScore: 'Saúde Financeira',
      savingsRate: 'Taxa de Poupança',
      income: 'Receitas',
      expenses: 'Despesas',
      netWorth: 'Património Líquido',
      monthlyTrend: 'Tendência Mensal',
    },
    // Widgets
    widgets: {
      safeToSpend: {
        title: 'Disponível para Gastar',
        details: 'Detalhes',
        viewDetails: 'Ver detalhes',
        updated: 'Atualizado',
        liquidAssets: 'Dinheiro Líquido',
        comfortFloor: 'Limite de Conforto',
        pendingBills: 'Contas Pendentes',
        total: 'Total',
        setComfortFloor: 'Define o Limite de Conforto para ver o Disponível',
        goToSettings: 'Definições',
      },
      healthScore: {
        title: 'Saúde Financeira',
        excellent: 'Excelente',
        good: 'Bom',
        fair: 'Razoável',
        poor: 'Precisa Atenção',
        vsMonth: 'vs mês',
        showDetails: 'Ver detalhes',
        hideDetails: 'Esconder detalhes',
      },
      overview: {
        title: 'Visão Geral',
        investments: 'Investimentos',
        noInvestments: 'Sem investimentos',
        goals: 'Objetivos',
        debts: 'Dívidas',
        noGoals: 'Sem objetivos',
        noDebts: 'Sem dívidas',
        onTrack: 'no prazo',
        totalProgress: 'progresso total',
        monthMin: 'mês mínimo',
      },
      forecast: {
        title: 'Previsão de Cash Flow',
        comfortFloor: 'Limite',
        highConfidence: 'Alta confiança',
        mediumConfidence: 'Confiança média',
        lowConfidence: 'Dados limitados',
        daysUntilFloor: 'dias até ao limite',
        currentBalance: 'Atual',
        projected30Days: 'Em 30 dias',
      },
    },
    // Insights
    insights: {
      title: 'Insights',
      noInsights: 'Sem insights de momento',
      dismiss: 'Dispensar',
      act: 'Agir',
      view: 'Ver',
      urgent: 'Urgente',
      warning: 'Aviso',
      opportunity: 'Oportunidade',
      info: 'Informação',
      tax: 'Impostos',
      allCaughtUp: 'Tudo em dia!',
      noInsightsAtThisTime: 'Sem insights de momento.',
      taxAdvice: 'Não é aconselhamento financeiro. Consulta um profissional de impostos.',
      viewMore: 'Ver mais',
      viewAll: 'Ver todos os insights',
      dismissFailed: 'Falha ao dispensar',
      actFailed: 'Falha ao agir',
      healthScoreBonus: '+5 Health Score',
    },
    // Portfolio
    portfolio: {
      title: 'Portfólio',
      totalValue: 'Valor Total',
      dayChange: 'Variação Diária',
      totalReturn: 'Retorno Total',
      allocation: 'Alocação',
      holdings: 'Posições',
      addInvestment: 'Adicionar Investimento',
      taxExposure: 'Exposição Fiscal',
      refreshPrices: 'Atualizar Preços',
      ticker: 'Ticker',
      name: 'Nome',
      quantity: 'Qtd.',
      price: 'Preço',
      value: 'Valor',
      return: 'Retorno',
      plPercent: 'P/L %',
      shares: 'Ações',
      avgCost: 'Custo Médio',
      current: 'Atual',
      sell: 'Vender',
      sellShares: 'Vender Ações',
      selling: 'A vender...',
      confirmSell: 'Confirmar Venda',
      account: 'Conta',
      selectAccount: 'Seleciona conta',
      pricePerShare: 'Preço por ação',
      fees: 'Comissões',
      saleTotal: 'Total da venda',
      transactionHistory: 'Histórico de Transações',
      loadingHistory: 'A carregar...',
      noTransactions: 'Sem transações',
      invalidQuantity: 'Quantidade inválida',
      invalidPrice: 'Introduz um preço válido',
      soldSuccess: 'Vendidas',
      sellFailed: 'Falha ao vender',
      detailsOf: 'Detalhes de',
      insufficientShares: 'Posições insuficientes',
      selectInvestmentAccount: 'Selecionar Conta de Investimento',
      buy: 'Comprar',
      dividend: 'Dividendo',
      total: 'Total',
      investmentAdded: 'Investimento adicionado',
      noData: 'Sem dados disponíveis',
      realized: 'Realizado',
      unrealized: 'Não Realizado',
      showBreakdown: 'Mostrar detalhe por ticker',
      hideBreakdown: 'Ocultar detalhe por ticker',
      estimated: 'Est.',
    },
    // Planning
    planning: {
      title: 'Planeamento',
      goals: 'Objetivos',
      goalsDesc: 'Acompanha metas de poupança e marcos importantes',
      debt: 'Dívidas',
      debtDesc: 'Gere e otimiza o pagamento de dívidas',
      fire: 'FIRE',
      fireDesc: 'Projeta a tua independência financeira',
      emergencyFund: 'Fundo de Emergência',
      addGoal: 'Adicionar Objetivo',
      targetAmount: 'Valor Alvo',
      currentAmount: 'Valor Atual',
      deadline: 'Prazo',
      onTrack: 'No bom caminho',
      behind: 'Atrasado',
      goalName: 'Nome',
      linkedAccount: 'Conta Associada',
      none: 'Nenhuma',
      amountSyncNote: 'O montante atual será sincronizado da conta selecionada',
      saving: 'A guardar...',
      create: 'Criar',
      goalCreated: 'Objetivo criado',
      addDebt: 'Adicionar Dívida',
      debtName: 'Nome',
      debtType: 'Tipo',
      balance: 'Saldo Atual',
      youOwe: 'Deves',
      interestRate: 'Taxa de Juro Anual (%)',
      interestRateNote: 'Usada para calcular estratégias de pagamento',
      minPayment: 'Pagamento Mínimo Mensal',
      dueDay: 'Dia de Vencimento (1-31)',
      adding: 'A adicionar...',
      fillNameBalance: 'Por favor preenche o nome e o saldo',
      invalidBalance: 'Por favor introduz um saldo válido',
      dbConnectionFailed: 'Falha na ligação à base de dados',
      pleaseLogin: 'Por favor inicia sessão',
      debtAdded: 'Dívida adicionada com sucesso',
      addDebtFailed: 'Falha ao adicionar dívida',
      creditCard: 'Cartão de Crédito',
      personalLoan: 'Empréstimo Pessoal',
      mortgage: 'Hipoteca',
      autoLoan: 'Crédito Automóvel',
      studentLoan: 'Empréstimo Estudante',
      fireProjection: 'Projeção FIRE',
      currentNetWorth: 'Património Líquido Atual',
      fiTarget: 'Objetivo FI',
      monthlySavings: 'Poupança Mensal',
      withdrawalRate: 'Taxa de Levantamento',
      estimatedMonthlyExpense: 'Despesa Mensal Estimada (opcional)',
      yearsToFI: 'Anos para FI',
      retirementDate: 'Data de Reforma',
      annualSavings: 'Poupança Anual',
      impact: 'Impacto',
      savingExtra: 'Poupar',
      bringsRetirement: 'adianta a reforma',
      delaysRetirement: 'atrasa a reforma',
      years: 'anos',
      runway: 'Runway',
      basedOnAvgSpend: 'Baseado em despesa média de',
      target: 'Objetivo',
      months: 'meses',
      calculating: 'A calcular...',
      estimateMonthlySpend: 'Estimar despesa mensal',
      loanCalculator: {
        title: 'Calculadora de Empréstimos',
        subtitle: 'Compare diferentes cenários de crédito para encontrar a melhor opção.',
        addScenario: 'Adicionar Cenário',
        amount: 'Montante (€)',
        rate: 'Taxa (%)',
        months: 'Meses',
        fees: 'Comissões (€)',
        comparison: 'Comparação',
        schedule: 'Plano Financeiro',
        monthlyPayment: 'Prestação Mensal',
        totalInterest: 'Total Juros',
        totalCost: 'Custo Total',
        effectiveAPR: 'TAEG Efetiva',
        bestValue: 'Melhor Valor',
        recommendation: 'Recomendação: Escolha',
        saveText: 'Poupará',
      },
    },
    // Chat
    chat: {
      placeholder: 'Escreve a tua pergunta...',
      send: 'Enviar',
      thinking: 'A pensar...',
      newConversation: 'Nova Conversa',
      conversations: 'Conversas',
      greeting: 'Olá! Sou a Cora 👋',
      greetingSubtitle: 'A tua assistente financeira pessoal.',
      askAnything: 'Pergunta-me qualquer coisa:',
      orAskAnything: 'Ou pergunta-me qualquer coisa:',
      hereIsWhatIFound: 'Aqui está o que encontrei para ti:',
      starterQuestions: [
        'Quanto gastei este mês?',
        'Qual é o meu safe-to-spend?',
        'Onde estou a gastar mais dinheiro?',
        'Tenho subscrições ativas?',
        'Quanto posso deduzir no IRS?',
        'Quando é o prazo do e-Fatura?',
      ],
      disclaimer: 'Orientação educacional, não aconselhamento financeiro regulado.',
      listening: 'A ouvir...',
      startListening: 'Começar a falar',
      stopListening: 'Parar de ouvir',
    },
    // Pages
    pages: {
      home: {
        greeting: 'Olá!',
        subtitle: 'Aqui está o resumo das tuas finanças.',
        insightHistory: 'Histórico de Insights',
        noInsightsYet: 'Ainda não há insights guardados. Carrega um extrato bancário para começar!',
        goToData: 'Ir para Data →',
        viewDetails: 'Ver detalhes →',
        recentInsights: 'Insights Recentes',
      },
      dashboard: {
        title: 'Painel — Análise Detalhada',
        subtitle: 'Gráficos e KPIs disponíveis aqui.',
        overview: 'Visão Geral',
        recentInsights: 'Insights Recentes',
        thisMonthSpending: 'Gastos deste Mês',
      },
      data: {
        title: 'Dados',
        subtitle: 'Gere contas e transações.',
      },
      portfolio: {
        title: 'Portfólio',
        subtitle: 'Visão geral dos teus ativos e desempenho.',
        noHoldings: 'Ainda não tens posições. Começa a investir para construir o teu portfólio.',
        noHoldingsDesc: 'Ainda não tens posições. Começa a investir para construir o teu portfólio.',
        startInvesting: 'Começar a Investir',
        loginRequired: 'Inicia sessão para ver o teu portfólio.',
        loadError: 'Falha ao carregar portfólio',
      },
      planning: {
        title: 'Planeamento',
        subtitle: 'Define objetivos, elimina dívidas e planeia o teu futuro financeiro.',
        goalsCard: 'Objetivos',
        goalsCardDesc: 'Acompanha metas de poupança e marcos importantes',
        debtCard: 'Eliminador de Dívidas',
        debtCardDesc: 'Estratégias Avalanche vs Bola de Neve',
        fireProjection: 'Projeção FIRE',
      },
      goals: {
        title: 'Objetivos',
        addGoal: 'Adicionar Objetivo',
        noGoals: 'Ainda Sem Objetivos',
        noGoalsTitle: 'Ainda Sem Objetivos',
        noGoalsDesc: 'Cria o teu primeiro objetivo financeiro para começar a acompanhar o teu progresso.',
        createFirst: 'Criar o Teu Primeiro Objetivo',
        newGoal: 'Novo Objetivo',
      },
      debt: {
        title: 'Eliminador de Dívidas',
        subtitle: 'Acompanha e otimiza a tua estratégia de pagamento.',
        subtitleWithData: 'Compara estratégias de pagamento e elimina as tuas dívidas mais rápido.',
        addDebt: 'Adicionar Dívida',
        noDebt: 'Sem Dívidas!',
        noDebtTitle: 'Sem Dívidas!',
        noDebtDesc: 'Não tens dívidas registadas. Adiciona um cartão de crédito, empréstimo ou hipoteca para começar a planear a sua liquidação.',
        addFirst: 'Adiciona a Tua Primeira Dívida',
      },
      tax: {
        title: 'Impostos',
        subtitle: 'Calendário fiscal português e otimização de deduções IRS',
        deadlines: 'Prazos Fiscais',
        deductions: 'Deduções IRS',
        checklist: 'Checklist Fiscal',
        calendar: 'Calendário',
        noDeadlines: 'Sem prazos próximos!',
        markDone: 'Marcar como feito',
        dismiss: 'Dispensar',
        daysLeft: 'dias',
        today: 'Hoje!',
        tomorrow: 'Amanhã',
        deductible: 'Dedutível',
        estimatedBenefit: 'Benefício Est.',
        nifReminder: 'Lembre-se: peça sempre fatura com NIF para maximizar deduções.',
        disclaimer: '⚠️ Esta informação é educacional. Consulte um contabilista certificado para aconselhamento fiscal personalizado.',
        usefulInfo: 'Informação Útil',
        askCora: 'Perguntar à Cora',
        taxYear: 'Ano fiscal',
      },
    },
  },
  'en-US': {
    // Settings
    settings: {
      title: 'Settings',
      notifications: 'Notifications',
      notificationsDesc: 'Manage push notification preferences',
      data: 'Data & Privacy',
      dataDesc: 'Manage your data and privacy settings',
      language: 'Language',
      languageDesc: 'Choose the application language',
    },
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      noResults: 'No results',
      required: 'Required',
      optional: 'Optional',
      you: 'You',
      privacy: 'Privacy',
    },
    // Navigation
    nav: {
      home: 'Home',
      chat: 'Talk to Cora',
      dashboard: 'Dashboard',
      data: 'Data',
      portfolio: 'Portfolio',
      planning: 'Planning',
      settings: 'Settings',
      goals: 'Goals',
      learn: 'Learn',
    },
    // Header
    header: {
      available: 'Available',
      userMenu: 'User menu',
      logout: 'Log Out',
    },
    // Language names
    languages: {
      'pt-PT': 'Português (Portugal)',
      'en-US': 'English (US)',
    },
    // Accounts
    accounts: {
      title: 'Accounts',
      addAccount: 'Add Account',
      addFirst: 'Add your first account',
      noAccounts: 'No accounts yet',
      recalculate: 'Recalculate balances',
      name: 'Name',
      institution: 'Institution',
      type: 'Type',
      balance: 'Balance',
      interestRate: 'Interest Rate (APR %)',
      minPayment: 'Minimum Payment',
      dueDate: 'Due Date (1-31)',
      visibility: 'Visibility',
      visibilities: {
        personal: 'Personal (Only me)',
        shared: 'Shared (Household)',
      },
      types: {
        checking: 'Checking Account',
        savings: 'Savings Account',
        credit_card: 'Credit Card',
        loan: 'Loan',
        broker: 'Investments',
      },
      created: 'Account created',
      updated: 'Account updated',
      deleted: 'Account deleted',
      confirmDelete: 'Confirm deletion',
      deleteWarning: 'This action cannot be undone. All associated transactions will also be deleted.',
    },
    // Transactions
    transactions: {
      title: 'Transactions',
      date: 'Date',
      description: 'Description',
      category: 'Category',
      amount: 'Amount',
      account: 'Account',
      confidence: 'Confidence',
      actions: 'Actions',
      details: 'Details',
      review: 'Review',
      ok: 'OK',
      selectAll: 'Select all',
      bulkEdit: 'Edit selected',
      noTransactions: 'No transactions yet',
      addTransaction: 'Add Transaction',
      adding: 'Adding...',
      addFailed: 'Failed to add transaction',
      showing: 'Showing',
      of: 'of',
      page: 'Page',
      previous: 'Previous',
      next: 'Next',
      selected: 'Selected',
      selectAllAcross: 'Select all',
      noDescription: 'No description',
      noCategory: 'No category',
      unknownAccount: 'Unknown',
      aiConfidence: 'AI Confidence',
      recurring: 'Recurring',
      yes: 'Yes',
      no: 'No',
      type: 'Type',
      expense: 'Expense',
      income: 'Income',
      selectAccount: 'Select account...',
      fillRequired: 'Please fill in all required fields',
      validAmount: 'Please enter a valid amount',
      addSuccess: 'Transaction added successfully',
    },
    // Upload
    upload: {
      title: 'Import Statement',
      dropzone: 'Drag a PDF or click to select',
      processing: 'Processing...',
      success: 'Import complete',
      error: 'Import error',
      chooseFile: 'Choose File',
      noFileSelected: 'No file selected',
      fileReady: 'File ready',
      processingMethod: 'Processing Method',
      autoMethod: 'Auto (Moey → Regex, Others → AI)',
      regexMethod: 'Regex (Fast, Moey only, no AI)',
      aiMethod: 'AI (OpenRouter, any bank)',
      aiModel: 'AI Model (fallback)',
      targetAccount: 'Target Account (optional)',
      autoDetect: 'Auto-detect from PDF',
      importTransactions: 'Import Transactions',
      preview: 'Preview',
      importing: 'Importing...',
      offline: 'Offline: Upload disabled until connection is restored.',
      extracted: 'Extracted',
      moeyDetected: 'Moey statement detected - Regex parser available',
      imported: 'Imported',
      via: 'via',
      accountBreakdown: 'Account breakdown',
      multiAccountProcessed: 'Multi-account PDF processed',
      onlyPdf: 'Only PDF files are accepted',
      fileTooLarge: 'File too large (max 5MB)',
      importNow: 'Import Transactions Now',
    },
    // Privacy
    privacy: {
      checking: 'Checking security...',
      encrypted: 'Encrypted',
      checkSecurity: 'Check Security',
      region: 'Region',
      unknownRegion: 'Unknown region',
    },
    // Install
    install: {
      installCora: 'Install Cora',
      iosInstructions: 'To install on iOS: tap Share → Add to Home Screen.',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      safeToSpend: 'Safe to spend',
      healthScore: 'Financial Health',
      savingsRate: 'Savings Rate',
      income: 'Income',
      expenses: 'Expenses',
      netWorth: 'Net Worth',
      monthlyTrend: 'Monthly Trend',
    },
    // Widgets
    widgets: {
      safeToSpend: {
        title: 'Safe to Spend',
        details: 'Details',
        viewDetails: 'View details',
        updated: 'Updated',
        liquidAssets: 'Liquid Assets',
        comfortFloor: 'Comfort Floor',
        pendingBills: 'Pending Bills',
        total: 'Total',
        setComfortFloor: 'Set your Comfort Floor to see Safe to Spend',
        goToSettings: 'Settings',
      },
      healthScore: {
        title: 'Financial Health',
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Needs Attention',
        vsMonth: 'vs month',
        showDetails: 'View details',
        hideDetails: 'Hide details',
      },
      overview: {
        title: 'Overview',
        investments: 'Investments',
        noInvestments: 'No investments',
        goals: 'Goals',
        debts: 'Debts',
        noGoals: 'No goals',
        noDebts: 'No debts',
        onTrack: 'on track',
        totalProgress: 'total progress',
        monthMin: 'month minimum',
      },
      forecast: {
        title: 'Cash Flow Forecast',
        comfortFloor: 'Floor',
        highConfidence: 'High confidence',
        mediumConfidence: 'Medium confidence',
        lowConfidence: 'Limited data',
        daysUntilFloor: 'days until floor',
        currentBalance: 'Current',
        projected30Days: 'In 30 days',
      },
    },
    // Insights
    insights: {
      title: 'Insights',
      noInsights: 'No insights at the moment',
      dismiss: 'Dismiss',
      act: 'Act',
      view: 'View',
      urgent: 'Urgent',
      warning: 'Warning',
      opportunity: 'Opportunity',
      info: 'Info',
      tax: 'Tax',
      allCaughtUp: 'All caught up!',
      noInsightsAtThisTime: 'No insights at this time.',
      taxAdvice: 'Not financial advice. Consult a tax professional.',
      viewMore: 'View more',
      viewAll: 'View all insights',
      dismissFailed: 'Dismiss failed',
      actFailed: 'Act failed',
      healthScoreBonus: '+5 Health Score',
    },
    // Portfolio
    portfolio: {
      title: 'Portfolio',
      totalValue: 'Total Value',
      dayChange: 'Day Change',
      totalReturn: 'Total Return',
      allocation: 'Allocation',
      holdings: 'Holdings',
      addInvestment: 'Add Investment',
      taxExposure: 'Tax Exposure',
      refreshPrices: 'Refresh Prices',
      ticker: 'Ticker',
      name: 'Name',
      quantity: 'Qty',
      price: 'Price',
      value: 'Value',
      return: 'Return',
      plPercent: 'P/L %',
      shares: 'Shares',
      avgCost: 'Avg Cost',
      current: 'Current',
      sell: 'Sell',
      sellShares: 'Sell Shares',
      selling: 'Selling...',
      confirmSell: 'Confirm Sale',
      account: 'Account',
      selectAccount: 'Select account',
      pricePerShare: 'Price per share',
      fees: 'Fees',
      saleTotal: 'Sale total',
      transactionHistory: 'Transaction History',
      loadingHistory: 'Loading...',
      noTransactions: 'No transactions',
      invalidQuantity: 'Invalid quantity',
      invalidPrice: 'Enter a valid price',
      soldSuccess: 'Sold',
      sellFailed: 'Failed to sell',
      detailsOf: 'Details of',
      insufficientShares: 'Insufficient shares',
      selectInvestmentAccount: 'Select Investment Account',
      buy: 'Buy',
      dividend: 'Dividend',
      total: 'Total',
      investmentAdded: 'Investment added',
      noData: 'No data available',
      realized: 'Realized',
      unrealized: 'Unrealized',
      showBreakdown: 'Show per-ticker breakdown',
      hideBreakdown: 'Hide per-ticker breakdown',
      estimated: 'Est.',
    },
    // Planning
    planning: {
      title: 'Planning',
      goals: 'Goals',
      goalsDesc: 'Track savings goals and important milestones',
      debt: 'Debt',
      debtDesc: 'Manage and optimize debt payments',
      fire: 'FIRE',
      fireDesc: 'Project your financial independence',
      emergencyFund: 'Emergency Fund',
      addGoal: 'Add Goal',
      targetAmount: 'Target Amount',
      currentAmount: 'Current Amount',
      deadline: 'Deadline',
      onTrack: 'On track',
      behind: 'Behind',
      goalName: 'Name',
      linkedAccount: 'Linked Account',
      none: 'None',
      amountSyncNote: 'Current amount will sync from selected account',
      saving: 'Saving...',
      create: 'Create',
      goalCreated: 'Goal created',
      addDebt: 'Add Debt',
      debtName: 'Name',
      debtType: 'Type',
      balance: 'Current Balance',
      youOwe: 'You owe',
      interestRate: 'Annual Interest Rate (%)',
      interestRateNote: 'Used to calculate payoff strategies',
      minPayment: 'Minimum Monthly Payment',
      dueDay: 'Due Day (1-31)',
      adding: 'Adding...',
      fillNameBalance: 'Please fill in name and balance',
      invalidBalance: 'Please enter a valid balance',
      dbConnectionFailed: 'Database connection failed',
      pleaseLogin: 'Please log in',
      debtAdded: 'Debt added successfully',
      addDebtFailed: 'Failed to add debt',
      creditCard: 'Credit Card',
      personalLoan: 'Personal Loan',
      mortgage: 'Mortgage',
      autoLoan: 'Auto Loan',
      studentLoan: 'Student Loan',
      fireProjection: 'FIRE Projection',
      currentNetWorth: 'Current Net Worth',
      fiTarget: 'FI Target',
      monthlySavings: 'Monthly Savings',
      withdrawalRate: 'Withdrawal Rate',
      estimatedMonthlyExpense: 'Estimated Monthly Expense (optional)',
      yearsToFI: 'Years to FI',
      retirementDate: 'Retirement Date',
      annualSavings: 'Annual Savings',
      impact: 'Impact',
      savingExtra: 'Saving',
      bringsRetirement: 'brings retirement forward',
      delaysRetirement: 'delays retirement',
      years: 'years',
      runway: 'Runway',
      basedOnAvgSpend: 'Based on avg spend of',
      target: 'Target',
      months: 'months',
      calculating: 'Calculating...',
      estimateMonthlySpend: 'Estimate monthly spend',
      loanCalculator: {
        title: 'Loan Calculator',
        subtitle: 'Compare different loan scenarios to find the best option.',
        addScenario: 'Add Scenario',
        amount: 'Amount (€)',
        rate: 'Rate (%)',
        months: 'Months',
        fees: 'Fees (€)',
        comparison: 'Comparison',
        schedule: 'Amortization',
        monthlyPayment: 'Monthly Payment',
        totalInterest: 'Total Interest',
        totalCost: 'Total Cost',
        effectiveAPR: 'Effective APR',
        bestValue: 'Best Value',
        recommendation: 'Recommendation: Choose',
        saveText: 'You will save',
      },
    },
    // Chat
    chat: {
      placeholder: 'Type your question...',
      send: 'Send',
      thinking: 'Thinking...',
      newConversation: 'New Conversation',
      conversations: 'Conversations',
      greeting: 'Hi! I\'m Cora 👋',
      greetingSubtitle: 'Your personal finance assistant.',
      askAnything: 'Ask me anything:',
      orAskAnything: 'Or ask me anything:',
      hereIsWhatIFound: 'Here\'s what I found for you:',
      starterQuestions: [
        'How much did I spend this month?',
        'What\'s my safe-to-spend?',
        'Where am I spending the most?',
        'Do I have active subscriptions?',
        'How much can I deduct on my IRS?',
        'When is the e-Fatura deadline?',
      ],
      disclaimer: 'Educational guidance, not regulated financial advice.',
      listening: 'Listening...',
      startListening: 'Start listening',
      stopListening: 'Stop listening',
    },
    // Pages
    pages: {
      home: {
        greeting: 'Hello!',
        subtitle: 'Here\'s a summary of your finances.',
        insightHistory: 'Insight History',
        noInsightsYet: 'No insights yet. Upload a bank statement to get started!',
        goToData: 'Go to Data →',
        viewDetails: 'View details →',
        recentInsights: 'Recent Insights',
      },
      dashboard: {
        title: 'Dashboard — Detailed Analysis',
        subtitle: 'Charts and KPIs available here.',
        overview: 'Overview',
        recentInsights: 'Recent Insights',
        thisMonthSpending: 'This Month\'s Spending',
      },
      data: {
        title: 'Data',
        subtitle: 'Manage accounts and transactions.',
      },
      portfolio: {
        title: 'Portfolio',
        subtitle: 'Overview of your assets and performance.',
        noHoldings: 'You don\'t have any holdings yet. Start investing to build your portfolio.',
        noHoldingsDesc: 'You don\'t have any holdings yet. Start investing to build your portfolio.',
        startInvesting: 'Start Investing',
        loginRequired: 'Please sign in to see your portfolio.',
        loadError: 'Failed to load portfolio',
      },
      planning: {
        title: 'Planning',
        subtitle: 'Set goals, eliminate debt, and plan your financial future.',
        goalsCard: 'Goals',
        goalsCardDesc: 'Track savings goals and important milestones',
        debtCard: 'Debt Eliminator',
        debtCardDesc: 'Avalanche vs Snowball strategies',
        fireProjection: 'FIRE Projection',
      },
      goals: {
        title: 'Goals',
        addGoal: 'Add Goal',
        noGoals: 'No Goals Yet',
        noGoalsTitle: 'No Goals Yet',
        noGoalsDesc: 'Create your first financial goal to start tracking your progress.',
        createFirst: 'Create Your First Goal',
        newGoal: 'New Goal',
      },
      debt: {
        title: 'Debt Eliminator',
        subtitle: 'Track and optimize your payment strategy.',
        subtitleWithData: 'Compare payment strategies and eliminate your debts faster.',
        addDebt: 'Add Debt',
        noDebt: 'No Debts!',
        noDebtTitle: 'No Debts!',
        noDebtDesc: 'You have no debts registered. Add a credit card, loan, or mortgage to start planning its payoff.',
        addFirst: 'Add Your First Debt',
      },
      tax: {
        title: 'Tax Planning',
        subtitle: 'Portuguese tax calendar and IRS deduction optimization',
        deadlines: 'Tax Deadlines',
        deductions: 'Tax Deductions',
        checklist: 'Tax Checklist',
        calendar: 'Calendar',
        noDeadlines: 'No upcoming deadlines!',
        markDone: 'Mark as done',
        dismiss: 'Dismiss',
        daysLeft: 'days',
        today: 'Today!',
        tomorrow: 'Tomorrow',
        deductible: 'Deductible',
        estimatedBenefit: 'Est. Benefit',
        nifReminder: 'Remember: always request invoices with NIF to maximize deductions.',
        disclaimer: '⚠️ This is educational information. Consult a certified accountant for personalized tax advice.',
        usefulInfo: 'Useful Information',
        askCora: 'Ask Cora',
        taxYear: 'Tax year',
      },
    },
  },
}
