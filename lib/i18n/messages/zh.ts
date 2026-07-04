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
};
