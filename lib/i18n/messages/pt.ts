import type { Messages } from "./en";

export const pt: Messages = {
  nav: {
    workflow: "Como funciona",
    customers: "Para quem",
    pricing: "Preços",
    login: "Entrar",
    signup: "Cadastre-se grátis",
  },
  hero: {
    badge: "Espaço self-service de prontidão aduaneira",
    headline: "Classifique produtos para a alfândega antes do embarque.",
    description:
      "Gere candidatos de código SH, perguntas sobre informações faltantes, checklists de documentos, alertas de risco e relatórios de prontidão aduaneira diretamente no navegador.",
    ctaPrimary: "Começar classificação grátis",
    ctaSecondary: "Enviar lista de SKUs",
    trust:
      "Feito para importadores, exportadores, marcas de e-commerce e equipes logísticas com SKUs recorrentes.",
  },
  compare: {
    badge: "Por que Kustaro",
    heading: "Não é só um palpite de código SH.",
    genericTitle: "Ferramentas genéricas de tarifas com IA",
    kustaroTitle: "Kustaro",
    genericRows: [
      "Uma única caixa de texto",
      "Retorna apenas um código",
      "Sem melhoria de confiança",
      "Sem biblioteca de SKUs salvos",
      "Sem fluxo de prontidão",
      "Exportação/relatórios fracos",
      "Difícil de reutilizar com produtos recorrentes",
    ],
    kustaroRows: [
      "Assistente guiado de classificação",
      "Candidatos de código SH com justificativa",
      "Perguntas de informações faltantes que melhoram a confiança",
      "Pontuação de prontidão aduaneira",
      "Biblioteca de produtos/SKUs salvos",
      "Relatório de classificação exportável",
      "Feito para fluxos de SKUs recorrentes",
    ],
  },
  problem: {
    badge: "Problema",
    heading:
      "O trabalho aduaneiro por produto ainda está preso em e-mails, planilhas e buscas frágeis.",
    cards: [
      {
        title: "Incerteza na classificação",
        body: "Nomes de produto raramente se encaixam num código SH. O Kustaro fundamenta cada candidato em evidências, pontuação de confiança e sinalizações de revisão.",
      },
      {
        title: "Documentos faltantes",
        body: "Certificados e provas de origem costumam aparecer na fronteira. O Kustaro monta o checklist de documentos antes do embarque, não depois.",
      },
      {
        title: "Prontidão incerta",
        body: "Impostos, riscos e informações faltantes costumam surgir depois do preço fechado. O Kustaro pontua a prontidão aduaneira desde o início — você sabe o que corrigir.",
      },
    ],
  },
  workflow: {
    badge: "Como funciona",
    steps: [
      "Descreva o produto no assistente guiado",
      "Receba candidatos de código SH com justificativa e confiança",
      "Responda às perguntas faltantes para melhorar a confiança",
      "Exporte um relatório de prontidão aduaneira para revisão",
    ],
  },
  customers: {
    badge: "Para quem",
    heading: "Para comércio de SKUs recorrentes em qualquer rota, no mundo todo.",
    rows: [
      "Importadores de Shopify e e-commerce",
      "Pequenos importadores/exportadores",
      "Equipes logísticas com SKUs recorrentes",
      "Despachantes em pré-classificação",
    ],
  },
  example: {
    badge: "Exemplo de resultado",
    heading: "Relatórios de prontidão aduaneira, não transcrições de chatbot.",
    body: "Cada resultado inclui candidatos de código SH, pontuação de confiança, perguntas de informações faltantes, checklist de documentos exigidos, alertas de risco e uma pontuação de prontidão aduaneira de 0 a 100.",
    readiness: "Prontidão aduaneira",
    ready: "pronto para revisão",
    actions: ["Confirmar candidato SH", "Reunir prova de origem", "Responder 3 perguntas abertas"],
    planText:
      "Exemplo de camiseta de algodão: 6109.10 é o candidato recomendado com 84% de confiança; o certificado de origem não está confirmado e um código alternativo continua plausível — prontidão 78/100, com as perguntas abertas listadas para revisão.",
  },
  pricingPreview: {
    badge: "Prévia de preços",
    heading: "Comece grátis e faça upgrade quando os SKUs crescerem.",
    plans: {
      free: "3 classificações grátis por mês — sem cartão.",
      starter: "50 classificações com biblioteca de SKUs e exportações.",
      pro: "250 classificações, upload em massa beta e histórico completo.",
    },
  },
  disclaimer:
    "Nota de conformidade: os resultados do Kustaro são recomendações de prontidão aduaneira geradas a partir das informações disponíveis do produto e de dados tarifários de referência. Não são aconselhamento jurídico e não garantem aceitação pelas autoridades aduaneiras. A classificação final e as declarações devem ser verificadas antes do uso oficial.",
  footer: {
    tagline:
      "O Kustaro fornece recomendações de prontidão aduaneira geradas a partir de informações do produto e dados tarifários de referência. Não é aconselhamento jurídico e não garante aceitação pelas autoridades aduaneiras. Verifique a classificação final e as declarações antes do uso oficial.",
    pricing: "Preços",
    login: "Entrar",
    signup: "Cadastre-se",
  },
  legal: {
    privacy: "Política de Privacidade",
    terms: "Termos de Serviço",
    refunds: "Política de reembolso",
    lastUpdated: "Última atualização",
    authoritativeNote:
      "Este documento é fornecido em inglês. A versão em inglês é o texto vinculante; as traduções da interface não o modificam.",
    consentPrefix: "Ao criar uma conta, você concorda com",
    and: "e",
  },
  auth: {
    loginTitle: "Bem-vindo de volta",
    loginSubtitle: "Entre no seu espaço de trabalho Kustaro.",
    signupTitle: "Crie seu espaço de trabalho",
    signupSubtitle:
      "Classifique seu primeiro produto em minutos. O espaço é criado automaticamente — sem cartão de crédito.",
    fullName: "Nome completo",
    email: "E-mail de trabalho",
    password: "Senha",
    createAccount: "Criar conta",
    login: "Entrar",
    haveAccount: "Já tem uma conta?",
    noAccount: "Novo no Kustaro?",
    checkEmail: "Confira seu e-mail para confirmar a conta e depois entre.",
  },
  language: "Idioma",
  pricing: {
    badge: "Preços",
    title: "Planos self-service que escalam com seus SKUs.",
    subtitle:
      "Todos os planos produzem os mesmos candidatos SH, pontuações de prontidão e relatórios exportáveis — faça upgrade por volume, biblioteca de SKUs, upload em massa e recursos de equipe.",
    mostPopular: "Mais popular",
    perMonth: "/mês",
    starting: "a partir de",
    meteringBadge: "API",
    meteringTitle: "API Kustaro — lista de espera.",
    meteringBody:
      "A API do Kustaro permitirá que equipes classifiquem produtos, obtenham relatórios de prontidão aduaneira e integrem fluxos de candidatos SH aos sistemas internos. Fale conosco para acesso antecipado.",
    howItWorks: "Como funcionam os limites",
    notePre: "Cada",
    notePost:
      "classificação conta como um crédito no seu limite mensal e é registrada como evento de uso.",
    tiles: [
      "1 produto = 1 crédito de classificação",
      "Limites reiniciam todo mês",
      "Classificações antigas continuam visíveis",
    ],
    plans: {
      free: {
        desc: "Experimente o Kustaro nos primeiros produtos.",
        cta: "Começar grátis",
        features: [
          "3 classificações / mês",
          "Assistente guiado de classificação",
          "Pontuação de prontidão aduaneira",
          "Exportação básica (Markdown / JSON)",
        ],
      },
      starter: {
        desc: "Para pequenos importadores com SKUs recorrentes.",
        cta: "Escolher Starter",
        features: [
          "50 classificações / mês",
          "Biblioteca de SKUs salvos",
          "Histórico de classificações",
          "Exportar relatórios",
        ],
      },
      pro: {
        desc: "Para marcas em crescimento com volume.",
        cta: "Escolher Pro",
        features: [
          "250 classificações / mês",
          "Upload em massa (beta)",
          "Exportações PDF / CSV",
          "Histórico de classificações",
          "Biblioteca de SKUs salvos",
        ],
      },
      business: {
        desc: "Para equipes que classificam cada embarque.",
        cta: "Escolher Business",
        features: [
          "1.000 classificações / mês",
          "Espaço de trabalho em equipe (acesso antecipado)",
          "Acesso à API",
          "Limites prioritários",
          "Upload em massa (beta)",
        ],
      },
      forwarder: {
        desc: "Para agentes de carga e despachantes com volume sob medida.",
        cta: "Fale conosco",
        features: [
          "Volume sob medida",
          "Espaço de trabalho em equipe (acesso antecipado)",
          "Acesso à API",
          "Fluxos personalizados",
          "Suporte de implantação",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Espaço de prontidão aduaneira",
      newPlan: "Nova classificação",
      nav: {
        dashboard: "Painel",
        plans: "Classificações",
        products: "Produtos",
        bulkUpload: "Upload em massa",
        apiKeys: "Chaves de API",
        billing: "Planos",
      },
    },
    topbar: {
      plan: "plano",
      upgrade: "Fazer upgrade",
      signOut: "Sair",
    },
    plansTitle: "Classificações",
    plansSubtitle: "Todas as classificações do seu espaço de trabalho.",
    wizard: {
      newTitle: "Classificar um produto",
      newSubtitle:
        "Dados guiados na entrada, prontidão aduaneira na saída: candidatos SH com justificativa, pontuação de confiança, perguntas abertas, checklist de documentos, alertas de risco e relatório exportável.",
      steps: ["Produto", "Características", "Rota comercial", "Documentos", "Gerar"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      prefill: "Preencher uma demo:",
      demoTshirt: "Camiseta de algodão",
      demoBattery: "Bateria de e-bike",
      quickFind: "Busca rápida",
      quickFindPlaceholder: "ex.: S-Works Tarmac SL9",
      quickFindHelp:
        "Digite marca + modelo e preencheremos descrição, material, uso, categoria, marca, modelo e peso unitário.",
      quickFindConfirm:
        "Os campos abaixo já são editáveis (o peso unitário, na etapa de rota, também vem preenchido) — revise, corrija o que for preciso e confirme antes de continuar.",
      quickFindNudge: "Confirme se os dados estão corretos antes de continuar.",
      optional: "(opcional)",
      select: "Selecione…",
      fields: {
        productName: "Nome do produto",
        productDescription: "Descrição do produto",
        material: "Material / composição",
        intendedUse: "Uso pretendido",
        category: "Categoria",
        brand: "Marca",
        model: "Modelo",
        sku: "SKU",
        originCountry: "País de origem",
        destinationCountry: "País de destino",
        supplierCountry: "País do fornecedor",
        shippingMethod: "Método de envio",
        declaredValue: "Valor declarado",
        currency: "Moeda",
        quantity: "Quantidade",
        unitWeight: "Peso unitário (kg)",
        invoiceText: "Texto da fatura (colar)",
        specText: "Texto da ficha técnica (colar)",
        certificate: "Há certificado de origem disponível para este produto",
      },
      factsIntro: "Quais destas descrevem o produto?",
      factsHint:
        "Essas marcações direcionam categorias de alto risco (baterias, alimentos, cosméticos, químicos, médicos, uso duplo…) aos controles e documentos corretos.",
      flags: {
        is_textile: "Produto têxtil",
        is_electronics: "Eletrônico",
        contains_battery: "Contém bateria",
        is_food: "Produto alimentício",
        is_cosmetic: "Produto cosmético",
        is_medical_or_health_related: "Médico / relacionado à saúde",
        is_chemical: "Produto químico",
        is_dual_use_or_restricted: "Uso duplo ou restrito",
      },
      invoicePlaceholder: "Cole aqui os itens da fatura comercial (opcional)…",
      specPlaceholder: "Cole aqui o texto da ficha técnica (opcional)…",
      supplierHint:
        "Onde você compra ou de onde envia — preencha só se for diferente do país de origem (fabricação). Uma divergência adiciona um ponto de verificação de prova de origem.",
      roadUnavailable:
        "Rodoviário indisponível nesta rota — não há ligação terrestre entre esses países.",
      methods: {
        sea: "Frete marítimo",
        air: "Frete aéreo",
        road: "Rodoviário",
        roadNoRoute: "Rodoviário (sem rota terrestre)",
        courier: "Courier / encomenda",
      },
      documentsIntro:
        "Opcionalmente cole texto de fatura ou ficha técnica e indique certificados disponíveis — isso melhora a avaliação de prontidão. O upload de arquivos captura só metadados por enquanto (a extração completa vem em breve).",
      clickToSelect: "Clique para selecionar arquivos",
      fileTypes: "PDF, texto, imagens",
      reviewTitle: "Revisar e gerar",
      reviewProduct: "Produto",
      reviewTradeLane: "Rota comercial",
      reviewDocuments: "Documentos anexados",
      reviewFlags: "Características do produto",
      reviewNote:
        "Vamos normalizar a descrição, buscar códigos candidatos, raciocinar sobre eles e produzir um relatório de prontidão aduaneira com pontuação de confiança. Itens de alto risco ou baixa confiança são sinalizados para revisão.",
      confirmRecommendation:
        "Entendo que este resultado é uma recomendação de prontidão aduaneira para revisão — não uma classificação aduaneira definitiva nem aconselhamento jurídico.",
      confirmNudge: "Confirme a nota de apenas-recomendação antes de gerar.",
      back: "Voltar",
      continue: "Continuar",
      classify: "Gerar classificação",
    },
  },
};
