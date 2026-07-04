import type { Messages } from "./en";

export const es: Messages = {
  nav: {
    workflow: "Flujo de trabajo",
    customers: "Clientes",
    pricing: "Precios",
    login: "Iniciar sesión",
    signup: "Registrarse gratis",
  },
  hero: {
    badge: "Agente de operaciones de envío con IA",
    description:
      "Un espacio de trabajo asistido por IA para importadores y exportadores que convierte los datos del producto en recomendaciones de códigos HS, listas de documentos, puntos de control de cumplimiento, acciones de ahorro y planes de ejecución de envíos.",
    ctaPrimary: "Crear plan de envío",
    ctaSecondary: "Ver precios",
  },
  problem: {
    badge: "Problema",
    heading:
      "El trabajo aduanero a nivel de producto sigue atrapado en correos, hojas de cálculo y búsquedas frágiles.",
    cards: [
      {
        title: "Incertidumbre de clasificación",
        body: "Los nombres de producto rara vez corresponden con claridad a un código HS. TariffOS fundamenta cada recomendación en evidencia, puntuaciones de confianza y controles de revisión.",
      },
      {
        title: "Documentos faltantes",
        body: "Los certificados y pruebas de origen suelen aparecer en la frontera. TariffOS crea la lista de documentos antes de reservar, no después.",
      },
      {
        title: "Sorpresas tardías de costo",
        body: "Los aranceles, el IVA y las tasas suelen aparecer tras fijar el precio. TariffOS los estima por adelantado y sugiere palancas de ahorro legítimas.",
      },
    ],
  },
  workflow: {
    badge: "Cómo funciona",
    steps: [
      "Normalizar los datos del producto y la ruta comercial",
      "Recuperar códigos HS candidatos con evidencia",
      "Generar controles de documentos y cumplimiento",
      "Producir acciones de costo y un plan de envío",
    ],
  },
  customers: {
    badge: "Para quién es",
    heading:
      "Creado para el comercio de SKU recurrentes en cualquier ruta, en cualquier parte del mundo.",
    rows: [
      "Importadores de Shopify y comercio electrónico",
      "Pequeños importadores/exportadores",
      "Transitarios que gestionan SKU recurrentes",
      "Agentes de aduanas que hacen preclasificación",
    ],
  },
  example: {
    badge: "Ejemplo de resultado",
    heading: "Planes de ejecución de envíos, no transcripciones de chatbot.",
    body: "Cada resultado incluye códigos candidatos, confianza, información faltante, documentos requeridos, advertencias, próximas acciones, controles de cumplimiento y palancas de reducción de costos.",
    readiness: "Preparación del envío",
    ready: "listo con revisión",
    actions: ["Confirmar código HS", "Reunir prueba de origen", "Comparar cotizaciones de flete"],
    planText:
      "Plan del agente para un envío de camisetas de algodón: usar 6109.10 como clasificación de trabajo, reunir la factura y la evidencia de origen, validar la base de valor y comparar opciones de transporte antes de reservar.",
  },
  pricingPreview: {
    badge: "Vista previa de precios",
    heading: "Empieza pequeño, escala al volumen de API.",
    plans: {
      free: "Prueba TariffOS con clasificaciones manuales.",
      starter: "Para pequeños importadores que envían SKU recurrentes.",
      growth: "Para marcas y equipos en crecimiento que necesitan la API.",
    },
  },
  disclaimer:
    "Aviso de cumplimiento: los resultados de TariffOS son recomendaciones generadas a partir de la información del producto y los datos arancelarios disponibles. No constituyen asesoría legal. La clasificación final, el tratamiento arancelario y las declaraciones aduaneras deben confirmarse con un agente de aduanas cualificado o la autoridad aduanera.",
  footer: {
    tagline:
      "TariffOS ofrece recomendaciones de clasificación generadas a partir de la información del producto y los datos arancelarios. No constituye asesoría legal. La clasificación final y el tratamiento arancelario deben confirmarse con un agente de aduanas cualificado o la autoridad aduanera.",
    pricing: "Precios",
    login: "Iniciar sesión",
    signup: "Registrarse",
  },
  legal: {
    privacy: "Política de privacidad",
    terms: "Términos del servicio",
    lastUpdated: "Última actualización",
    authoritativeNote:
      "Este documento se proporciona en inglés. La versión en inglés es el texto vinculante; las traducciones de la interfaz no lo modifican.",
    consentPrefix: "Al crear una cuenta, aceptas los",
    and: "y la",
  },
  auth: {
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión en tu espacio de trabajo de TariffOS.",
    signupTitle: "Crea tu espacio de trabajo",
    signupSubtitle:
      "Crea tu primer plan de envío en minutos. El espacio de trabajo se crea automáticamente, sin tarjeta de crédito.",
    fullName: "Nombre completo",
    email: "Correo de trabajo",
    password: "Contraseña",
    createAccount: "Crear cuenta",
    login: "Iniciar sesión",
    haveAccount: "¿Ya tienes una cuenta?",
    noAccount: "¿Nuevo en TariffOS?",
    checkEmail: "Revisa tu correo para confirmar tu cuenta y luego inicia sesión.",
  },
  language: "Idioma",
  pricing: {
    badge: "Precios",
    title: "Empieza gratis, escala al volumen de API.",
    subtitle:
      "Todos los planes producen los mismos planes de envío, listas de documentos e informes listos para el agente de aduanas: mejora para obtener volumen, asientos de equipo y la API.",
    mostPopular: "Más popular",
    perMonth: "/mes",
    starting: "desde",
    meteringBadge: "Medición de API",
    meteringTitle: "Precios de API basados en el uso.",
    meteringBody:
      "De 0,20 a 2,00 USD por clasificación según el volumen y el nivel de enriquecimiento. Hay descuentos por volumen y nivel en los planes Forwarder y Enterprise.",
    howItWorks: "Cómo funciona la medición",
    notePre: "Cada llamada",
    notePost:
      "cuenta como una clasificación de tu plan y se registra como un evento de uso para la medición.",
    tiles: [
      "1 llamada de API = 1 clasificación",
      "Descuentos por volumen a escala",
      "Precio según nivel de enriquecimiento",
    ],
    plans: {
      free: {
        desc: "Prueba TariffOS con clasificaciones manuales.",
        cta: "Empezar gratis",
        features: [
          "10 clasificaciones / mes",
          "Solo entrada manual",
          "Exportación básica (Markdown / JSON)",
          "Un solo usuario",
        ],
      },
      starter: {
        desc: "Para pequeños importadores con SKU recurrentes.",
        cta: "Elegir Starter",
        features: [
          "100 clasificaciones / mes",
          "Historial de clasificaciones",
          "Exportar informes",
          "Soporte básico por correo",
        ],
      },
      growth: {
        desc: "Para marcas y equipos en crecimiento que necesitan la API.",
        cta: "Elegir Growth",
        features: [
          "1.000 clasificaciones / mes",
          "Acceso a la API",
          "Carga de documentos",
          "Espacio de trabajo en equipo",
          "Ciclo de retroalimentación y aprendizaje",
        ],
      },
      forwarder: {
        desc: "Para transitarios y agentes con gran volumen.",
        cta: "Hablar con ventas",
        features: [
          "5.000+ clasificaciones / mes",
          "Acceso a la API",
          "Flujos de trabajo personalizados",
          "Cola de revisión prioritaria",
          "Soporte de incorporación",
        ],
      },
      enterprise: {
        desc: "Para organizaciones con datos y cumplimiento a medida.",
        cta: "Contáctanos",
        features: [
          "Adaptadores de datos arancelarios a medida",
          "SSO y registros de auditoría",
          "SLA y soporte dedicado",
          "Volumen personalizado",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Agente de operaciones de envío",
      newPlan: "Nuevo plan de envío",
      nav: {
        dashboard: "Panel",
        plans: "Planes de envío",
        apiKeys: "Claves de API",
        billing: "Planes",
      },
    },
    topbar: {
      plan: "plan",
      upgrade: "Mejorar",
      signOut: "Cerrar sesión",
    },
    plansTitle: "Planes de envío",
    plansSubtitle: "Todas las clasificaciones ejecutadas por tu espacio de trabajo.",
    wizard: {
      newTitle: "Nueva clasificación",
      newSubtitle:
        "Introduce los datos del producto para obtener un código arancelario recomendado con evidencia, confianza y un informe listo para el agente de aduanas.",
      steps: ["Producto", "Ruta comercial", "Documentos", "Revisión"],
      prefill: "Rellenar una demo:",
      demoTshirt: "Camiseta de algodón",
      demoBattery: "Batería de e-bike",
      quickFind: "Búsqueda rápida",
      quickFindPlaceholder: "p. ej. S-Works Tarmac SL9",
      quickFindHelp:
        "Escribe marca + modelo y completaremos la descripción, el material, el uso, la categoría, la marca, el modelo y el peso unitario.",
      quickFindConfirm:
        "Los campos de abajo ya son editables (el peso unitario, en el paso siguiente, también está prellenado): revísalos, corrige lo que haga falta y confirma antes de continuar.",
      quickFindNudge: "Confirma que los datos son correctos antes de continuar.",
      optional: "(opcional)",
      select: "Seleccionar…",
      fields: {
        productName: "Nombre del producto",
        productDescription: "Descripción del producto",
        material: "Material / composición",
        intendedUse: "Uso previsto",
        category: "Categoría",
        brand: "Marca",
        sku: "Modelo / SKU",
        originCountry: "País de origen",
        destinationCountry: "País de destino",
        supplierCountry: "País del proveedor",
        shippingMethod: "Método de envío",
        declaredValue: "Valor declarado",
        currency: "Moneda",
        quantity: "Cantidad",
        unitWeight: "Peso unitario (kg)",
      },
      supplierHint:
        "Donde compras o desde donde se envía — indícalo solo si difiere del país de origen (fabricación). Una discrepancia añade un punto de control de evidencia de origen a tu plan.",
      roadUnavailable:
        "La carretera no está disponible para esta ruta: no hay conexión terrestre entre estos países.",
      methods: {
        sea: "Marítimo",
        air: "Aéreo",
        road: "Carretera",
        roadNoRoute: "Carretera (sin ruta terrestre)",
        courier: "Mensajería / paquete",
      },
      documentsIntro:
        "Adjunta opcionalmente documentos de apoyo (factura comercial, lista de empaque, ficha del proveedor, catálogo). Por ahora solo registramos los metadatos del archivo: la extracción completa es provisional y aún no cambia la clasificación.",
      clickToSelect: "Haz clic para seleccionar archivos",
      fileTypes: "PDF, texto, imágenes",
      reviewTitle: "Revisar y clasificar",
      reviewProduct: "Producto",
      reviewTradeLane: "Ruta comercial",
      reviewDocuments: "Documentos adjuntos",
      reviewNote:
        "Normalizaremos la descripción, recuperaremos códigos candidatos, razonaremos sobre ellos y produciremos un informe listo para el agente de aduanas con una puntuación de confianza. Los artículos de alto riesgo o baja confianza se marcan para revisión.",
      back: "Atrás",
      continue: "Continuar",
      classify: "Clasificar producto",
    },
  },
};
