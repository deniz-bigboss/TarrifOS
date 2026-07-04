import type { Messages } from "./en";

export const zh: Messages = {
  nav: {
    workflow: "工作流程",
    customers: "客户",
    pricing: "价格",
    login: "登录",
    signup: "免费注册",
  },
  hero: {
    badge: "AI 运输运营代理",
    description:
      "面向进出口商的 AI 辅助工作空间，将产品信息转化为 HS 编码建议、单证清单、合规检查点、成本节约措施和运输执行计划。",
    ctaPrimary: "创建运输计划",
    ctaSecondary: "查看价格",
  },
  problem: {
    badge: "问题",
    heading: "产品层面的海关工作仍困于邮件、电子表格和脆弱的查询之中。",
    cards: [
      {
        title: "归类不确定性",
        body: "产品名称很少能清晰对应到某个 HS 编码。TariffOS 让每条建议都基于证据、置信度评分和复核环节。",
      },
      {
        title: "单证缺失",
        body: "证书和原产地证明往往在口岸才浮现。TariffOS 在订舱之前而非之后就建立单证清单。",
      },
      {
        title: "迟来的到岸成本意外",
        body: "关税、增值税和各项费用常在定价之后才出现。TariffOS 提前估算，并建议合法的降本手段。",
      },
    ],
  },
  workflow: {
    badge: "工作原理",
    steps: [
      "规范化产品与贸易航线数据",
      "检索带证据的候选 HS 编码",
      "生成单证与合规检查点",
      "产出成本措施与运输计划",
    ],
  },
  customers: {
    badge: "适用对象",
    heading: "为全球任意航线上的重复 SKU 贸易而打造。",
    rows: [
      "Shopify 与电商进口商",
      "中小进出口商",
      "处理重复 SKU 的货运代理",
      "进行预归类的报关行",
    ],
  },
  example: {
    badge: "示例输出",
    heading: "运输执行计划，而非聊天记录。",
    body: "每个结果都包含候选编码、置信度、缺失信息、所需单证、警示、后续措施、合规检查点和降本杠杆。",
    readiness: "运输就绪度",
    ready: "复核后就绪",
    actions: ["确认 HS 编码", "收集原产地证明", "比较运费报价"],
    planText:
      "棉质 T 恤运输的代理计划：以 6109.10 作为工作归类，收集发票与原产地证据，核实计价基础，并在订舱前比较承运人方案。",
  },
  pricingPreview: {
    badge: "价格预览",
    heading: "从小规模起步，扩展到 API 用量。",
    plans: {
      free: "使用手动归类体验 TariffOS。",
      starter: "适合运送重复 SKU 的小型进口商。",
      growth: "适合需要 API 的成长型品牌与团队。",
    },
  },
  disclaimer:
    "合规声明：TariffOS 的输出是根据可用的产品信息和关税数据生成的建议，并非法律意见。最终归类、税收处理和海关申报应由合格的报关行或海关当局确认。",
  footer: {
    tagline:
      "TariffOS 根据产品信息和关税数据提供归类建议，并非法律意见。最终归类和税收处理必须由合格的报关行或海关当局确认。",
    pricing: "价格",
    login: "登录",
    signup: "注册",
  },
  legal: {
    privacy: "隐私政策",
    terms: "服务条款",
    lastUpdated: "最近更新",
    authoritativeNote:
      "本文件以英文提供。英文版本为具有约束力的文本；界面翻译不构成对其的修改。",
    consentPrefix: "创建账户即表示您同意",
    and: "和",
  },
  auth: {
    loginTitle: "欢迎回来",
    loginSubtitle: "登录您的 TariffOS 工作空间。",
    signupTitle: "创建您的工作空间",
    signupSubtitle: "几分钟内创建您的首个运输计划。工作空间将自动创建——无需信用卡。",
    fullName: "全名",
    email: "工作邮箱",
    password: "密码",
    createAccount: "创建账户",
    login: "登录",
    haveAccount: "已经有账户？",
    noAccount: "初次使用 TariffOS？",
    checkEmail: "请查收邮件以确认您的账户，然后登录。",
  },
  language: "语言",
  pricing: {
    badge: "价格",
    title: "免费起步，扩展到 API 用量。",
    subtitle:
      "所有套餐生成同样的运输计划、单证清单和可交付报关行的报告——升级可获得更大用量、团队席位和 API。",
    mostPopular: "最受欢迎",
    perMonth: "/月",
    starting: "起",
    meteringBadge: "API 计量",
    meteringTitle: "按用量计费的 API 价格。",
    meteringBody:
      "每次归类 0.20–2.00 美元，取决于用量和数据丰富级别。Forwarder 和 Enterprise 套餐提供用量与级别折扣。",
    howItWorks: "计量方式",
    notePre: "每次",
    notePost: "调用计为套餐中的一次归类，并记录为一条计量用量事件。",
    tiles: [
      "1 次 API 调用 = 1 次归类",
      "规模化用量折扣",
      "按数据丰富级别定价",
    ],
    plans: {
      free: {
        desc: "使用手动归类体验 TariffOS。",
        cta: "免费开始",
        features: [
          "每月 10 次归类",
          "仅手动录入",
          "基础导出（Markdown / JSON）",
          "单用户",
        ],
      },
      starter: {
        desc: "适合运送重复 SKU 的小型进口商。",
        cta: "选择 Starter",
        features: [
          "每月 100 次归类",
          "归类历史记录",
          "导出报告",
          "基础邮件支持",
        ],
      },
      growth: {
        desc: "适合需要 API 的成长型品牌与团队。",
        cta: "选择 Growth",
        features: [
          "每月 1,000 次归类",
          "API 访问",
          "单证上传",
          "团队工作空间",
          "反馈与学习闭环",
        ],
      },
      forwarder: {
        desc: "适合高业务量的货运代理与报关行。",
        cta: "联系销售",
        features: [
          "每月 5,000+ 次归类",
          "API 访问",
          "自定义工作流",
          "优先复核队列",
          "上手支持",
        ],
      },
      enterprise: {
        desc: "适合有定制数据与合规需求的组织。",
        cta: "联系我们",
        features: [
          "定制关税数据适配器",
          "SSO 与审计日志",
          "SLA 与专属支持",
          "定制用量",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "运输运营代理",
      newPlan: "新建运输计划",
      nav: {
        dashboard: "仪表盘",
        plans: "运输计划",
        apiKeys: "API 密钥",
        billing: "套餐",
      },
    },
    topbar: {
      plan: "套餐",
      upgrade: "升级",
      signOut: "退出登录",
    },
    plansTitle: "运输计划",
    plansSubtitle: "您的工作空间运行过的所有归类。",
    wizard: {
      newTitle: "新建归类",
      newSubtitle:
        "输入产品信息，即可获得带证据、置信度和可交付报关行报告的推荐税则编码。",
      steps: ["产品", "贸易航线", "单证", "确认"],
      prefill: "填充示例：",
      demoTshirt: "棉质 T 恤",
      demoBattery: "电动自行车电池",
      quickFind: "快速查找",
      quickFindPlaceholder: "如 S-Works Tarmac SL9",
      quickFindHelp:
        "输入品牌 + 型号，我们会自动填写描述、材质、用途、类别、品牌、型号和单件重量。",
      quickFindConfirm:
        "下方字段现在可以编辑（下一步的单件重量也已预填）——请检查并修正错误，确认后再继续。",
      quickFindNudge: "请先确认信息无误再继续。",
      optional: "（可选）",
      select: "请选择…",
      fields: {
        productName: "产品名称",
        productDescription: "产品描述",
        material: "材质 / 成分",
        intendedUse: "预期用途",
        category: "类别",
        brand: "品牌",
        sku: "型号 / SKU",
        originCountry: "原产国",
        destinationCountry: "目的国",
        supplierCountry: "供应商所在国",
        shippingMethod: "运输方式",
        declaredValue: "申报价值",
        currency: "币种",
        quantity: "数量",
        unitWeight: "单件重量（kg）",
      },
      supplierHint:
        "采购或发货所在国——仅当与原产（制造）国不同时填写。不一致会在您的计划中新增一个原产地证据检查点。",
      roadUnavailable: "该航线无法使用公路运输——两国之间没有陆路连接。",
      methods: {
        sea: "海运",
        air: "空运",
        road: "公路",
        roadNoRoute: "公路（无陆路连接）",
        courier: "快递 / 包裹",
      },
      documentsIntro:
        "可选择附上支持单证（商业发票、装箱单、供应商规格书、产品目录）。目前仅记录文件元数据——完整解析尚为占位功能，还不会影响归类。",
      clickToSelect: "点击选择文件",
      fileTypes: "PDF、文本、图片",
      reviewTitle: "确认并归类",
      reviewProduct: "产品",
      reviewTradeLane: "贸易航线",
      reviewDocuments: "已附单证",
      reviewNote:
        "我们将规范化描述、检索候选编码并进行推理，生成带置信度评分、可直接交给报关行的报告。高风险或低置信度的条目会被标记复核。",
      back: "上一步",
      continue: "继续",
      classify: "归类产品",
    },
  },
};
