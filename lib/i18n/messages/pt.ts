import type { Messages } from "./en";

export const pt: Messages = {
  nav: {
    workflow: "Fluxo de trabalho",
    customers: "Clientes",
    pricing: "Preços",
    login: "Entrar",
    signup: "Cadastre-se grátis",
  },
  hero: {
    badge: "Agente de operações de envio com IA",
    description:
      "Um espaço de trabalho assistido por IA para importadores e exportadores que transforma os dados do produto em recomendações de código SH, listas de documentos, pontos de controle de conformidade, ações de economia e planos de execução de envio.",
    ctaPrimary: "Criar plano de envio",
    ctaSecondary: "Ver preços",
  },
  problem: {
    badge: "Problema",
    heading:
      "O trabalho aduaneiro no nível do produto ainda está preso em e-mails, planilhas e buscas frágeis.",
    cards: [
      {
        title: "Incerteza de classificação",
        body: "Os nomes dos produtos raramente correspondem com clareza a um código SH. O TariffOS baseia cada recomendação em evidências, pontuações de confiança e etapas de revisão.",
      },
      {
        title: "Documentos ausentes",
        body: "Certificados e provas de origem costumam surgir na fronteira. O TariffOS cria a lista de documentos antes da reserva, não depois.",
      },
      {
        title: "Surpresas tardias de custo",
        body: "Impostos, IVA e taxas costumam aparecer depois de o preço ser definido. O TariffOS os estima com antecedência e sugere alavancas de economia legítimas.",
      },
    ],
  },
  workflow: {
    badge: "Como funciona",
    steps: [
      "Normalizar os dados do produto e da rota comercial",
      "Recuperar códigos SH candidatos com evidências",
      "Gerar controles de documentos e conformidade",
      "Produzir ações de custo e um plano de envio",
    ],
  },
  customers: {
    badge: "Para quem é",
    heading:
      "Feito para o comércio de SKUs recorrentes em qualquer rota, em qualquer lugar do mundo.",
    rows: [
      "Importadores de Shopify e e-commerce",
      "Pequenos importadores/exportadores",
      "Agentes de carga que gerenciam SKUs recorrentes",
      "Despachantes aduaneiros que fazem pré-classificação",
    ],
  },
  example: {
    badge: "Exemplo de resultado",
    heading: "Planos de execução de envio, não transcrições de chatbot.",
    body: "Cada resultado inclui códigos candidatos, confiança, informações ausentes, documentos exigidos, avisos, próximas ações, pontos de controle de conformidade e alavancas de redução de custos.",
    readiness: "Prontidão do envio",
    ready: "pronto com revisão",
    actions: ["Confirmar código SH", "Reunir prova de origem", "Comparar cotações de frete"],
    planText:
      "Plano do agente para um envio de camisetas de algodão: usar 6109.10 como classificação de trabalho, reunir a fatura e a prova de origem, validar a base de valor e comparar as opções de transporte antes de reservar.",
  },
  pricingPreview: {
    badge: "Prévia de preços",
    heading: "Comece pequeno, escale para o volume de API.",
    plans: {
      free: "Experimente o TariffOS com classificações manuais.",
      starter: "Para pequenos importadores que enviam SKUs recorrentes.",
      growth: "Para marcas e equipes em crescimento que precisam da API.",
    },
  },
  disclaimer:
    "Aviso de conformidade: os resultados do TariffOS são recomendações geradas a partir das informações do produto e dos dados tarifários disponíveis. Não constituem aconselhamento jurídico. A classificação final, o tratamento tarifário e as declarações aduaneiras devem ser confirmados por um despachante aduaneiro qualificado ou pela autoridade aduaneira.",
  footer: {
    tagline:
      "O TariffOS fornece recomendações de classificação geradas a partir das informações do produto e dos dados tarifários. Não é aconselhamento jurídico. A classificação final e o tratamento tarifário devem ser confirmados por um despachante aduaneiro qualificado ou pela autoridade aduaneira.",
    pricing: "Preços",
    login: "Entrar",
    signup: "Cadastrar",
  },
  legal: {
    privacy: "Política de Privacidade",
    terms: "Termos de Serviço",
    lastUpdated: "Última atualização",
    authoritativeNote:
      "Este documento é fornecido em inglês. A versão em inglês é o texto vinculante; as traduções da interface não o modificam.",
    consentPrefix: "Ao criar uma conta, você concorda com os",
    and: "e a",
  },
  auth: {
    loginTitle: "Bem-vindo de volta",
    loginSubtitle: "Entre no seu espaço de trabalho TariffOS.",
    signupTitle: "Crie seu espaço de trabalho",
    signupSubtitle:
      "Crie seu primeiro plano de envio em minutos. O espaço de trabalho é criado automaticamente — sem cartão de crédito.",
    fullName: "Nome completo",
    email: "E-mail de trabalho",
    password: "Senha",
    createAccount: "Criar conta",
    login: "Entrar",
    haveAccount: "Já tem uma conta?",
    noAccount: "Novo no TariffOS?",
    checkEmail: "Verifique seu e-mail para confirmar sua conta e depois entre.",
  },
  language: "Idioma",
  pricing: {
    badge: "Preços",
    title: "Comece grátis, escale para o volume de API.",
    subtitle:
      "Todos os planos produzem os mesmos planos de envio, listas de documentos e relatórios prontos para o despachante — faça upgrade para volume, assentos de equipe e a API.",
    mostPopular: "Mais popular",
    perMonth: "/mês",
    starting: "a partir de",
    meteringBadge: "Medição de API",
    meteringTitle: "Preços de API por uso.",
    meteringBody:
      "De US$ 0,20 a US$ 2,00 por classificação, conforme o volume e o nível de enriquecimento. Descontos por volume e nível estão disponíveis nos planos Forwarder e Enterprise.",
    howItWorks: "Como funciona a medição",
    notePre: "Cada chamada",
    notePost:
      "conta como uma classificação do seu plano e é registrada como um evento de uso para medição.",
    tiles: [
      "1 chamada de API = 1 classificação",
      "Descontos por volume em escala",
      "Preço por nível de enriquecimento",
    ],
    plans: {
      free: {
        desc: "Experimente o TariffOS com classificações manuais.",
        cta: "Começar grátis",
        features: [
          "10 classificações / mês",
          "Somente entrada manual",
          "Exportação básica (Markdown / JSON)",
          "Usuário único",
        ],
      },
      starter: {
        desc: "Para pequenos importadores com SKUs recorrentes.",
        cta: "Escolher Starter",
        features: [
          "100 classificações / mês",
          "Histórico de classificações",
          "Exportar relatórios",
          "Suporte básico por e-mail",
        ],
      },
      growth: {
        desc: "Para marcas e equipes em crescimento que precisam da API.",
        cta: "Escolher Growth",
        features: [
          "1.000 classificações / mês",
          "Acesso à API",
          "Envio de documentos",
          "Espaço de trabalho em equipe",
          "Ciclo de feedback e aprendizado",
        ],
      },
      forwarder: {
        desc: "Para agentes de carga e despachantes com alto volume.",
        cta: "Falar com vendas",
        features: [
          "5.000+ classificações / mês",
          "Acesso à API",
          "Fluxos de trabalho personalizados",
          "Fila de revisão prioritária",
          "Suporte de integração",
        ],
      },
      enterprise: {
        desc: "Para organizações com dados e conformidade sob medida.",
        cta: "Fale conosco",
        features: [
          "Adaptadores de dados tarifários sob medida",
          "SSO e logs de auditoria",
          "SLA e suporte dedicado",
          "Volume personalizado",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Agente de operações de envio",
      newPlan: "Novo plano de envio",
      nav: {
        dashboard: "Painel",
        plans: "Planos de envio",
        apiKeys: "Chaves de API",
        billing: "Planos",
      },
    },
    topbar: {
      plan: "plano",
      upgrade: "Fazer upgrade",
      signOut: "Sair",
    },
    plansTitle: "Planos de envio",
    plansSubtitle: "Todas as classificações executadas pelo seu espaço de trabalho.",
    wizard: {
      newTitle: "Nova classificação",
      newSubtitle:
        "Insira os dados do produto para obter um código tarifário recomendado com evidências, confiança e um relatório pronto para o despachante.",
      steps: ["Produto", "Rota comercial", "Documentos", "Revisão"],
      prefill: "Preencher uma demo:",
      demoTshirt: "Camiseta de algodão",
      demoBattery: "Bateria de e-bike",
      quickFind: "Busca rápida",
      quickFindPlaceholder: "ex.: S-Works Tarmac SL9",
      quickFindHelp:
        "Digite marca + modelo e preencheremos a descrição, o material, o uso, a categoria, a marca, o modelo e o peso unitário.",
      quickFindConfirm:
        "Os campos abaixo agora são editáveis (o peso unitário, na próxima etapa, também foi pré-preenchido) — revise-os, corrija o que for preciso e confirme antes de continuar.",
      quickFindNudge: "Confirme que os dados estão corretos antes de continuar.",
      optional: "(opcional)",
      select: "Selecionar…",
      fields: {
        productName: "Nome do produto",
        productDescription: "Descrição do produto",
        material: "Material / composição",
        intendedUse: "Uso pretendido",
        category: "Categoria",
        brand: "Marca",
        sku: "Modelo / SKU",
        originCountry: "País de origem",
        destinationCountry: "País de destino",
        supplierCountry: "País do fornecedor",
        shippingMethod: "Método de envio",
        declaredValue: "Valor declarado",
        currency: "Moeda",
        quantity: "Quantidade",
        unitWeight: "Peso unitário (kg)",
      },
      supplierHint:
        "Onde você compra ou de onde o envio parte — informe apenas se for diferente do país de origem (fabricação). Uma divergência adiciona um ponto de verificação de prova de origem ao seu plano.",
      roadUnavailable:
        "Rodoviário indisponível para esta rota — não há ligação terrestre entre esses países.",
      methods: {
        sea: "Marítimo",
        air: "Aéreo",
        road: "Rodoviário",
        roadNoRoute: "Rodoviário (sem rota terrestre)",
        courier: "Courier / encomenda",
      },
      documentsIntro:
        "Anexe opcionalmente documentos de apoio (fatura comercial, romaneio, ficha do fornecedor, catálogo do produto). Por enquanto registramos apenas os metadados dos arquivos — a extração completa é provisória e ainda não altera a classificação.",
      clickToSelect: "Clique para selecionar arquivos",
      fileTypes: "PDF, texto, imagens",
      reviewTitle: "Revisar e classificar",
      reviewProduct: "Produto",
      reviewTradeLane: "Rota comercial",
      reviewDocuments: "Documentos anexados",
      reviewNote:
        "Vamos normalizar a descrição, recuperar códigos candidatos, raciocinar sobre eles e produzir um relatório pronto para o despachante com pontuação de confiança. Itens de alto risco ou baixa confiança são marcados para revisão.",
      back: "Voltar",
      continue: "Continuar",
      classify: "Classificar produto",
    },
  },
};
