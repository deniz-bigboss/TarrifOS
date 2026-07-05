import type { Messages } from "./en";

export const es: Messages = {
  nav: {
    workflow: "Cómo funciona",
    customers: "Para quién",
    pricing: "Precios",
    login: "Iniciar sesión",
    signup: "Regístrate gratis",
  },
  hero: {
    badge: "Espacio de trabajo autoservicio de preparación aduanera",
    headline: "Clasifica tus productos para aduanas antes de enviarlos.",
    description:
      "Genera candidatos de código HS, preguntas sobre información faltante, listas de documentos, alertas de riesgo e informes de preparación aduanera directamente en tu navegador.",
    ctaPrimary: "Empieza a clasificar gratis",
    ctaSecondary: "Subir lista de SKU",
    trust:
      "Creado para importadores, exportadores, marcas de e-commerce y equipos logísticos con SKUs recurrentes.",
  },
  compare: {
    badge: "Por qué Kustaro",
    heading: "No es solo una suposición de código HS.",
    genericTitle: "Herramientas de tarifas con IA genéricas",
    kustaroTitle: "Kustaro",
    genericRows: [
      "Un solo cuadro de texto",
      "Devuelve un código",
      "Sin mejora de la confianza",
      "Sin biblioteca de SKU guardados",
      "Sin flujo de preparación",
      "Exportación e informes débiles",
      "Difícil de reutilizar con productos recurrentes",
    ],
    kustaroRows: [
      "Asistente guiado de clasificación",
      "Candidatos de código HS con razonamiento",
      "Preguntas de información faltante que mejoran la confianza",
      "Puntuación de preparación aduanera",
      "Biblioteca de productos/SKU guardados",
      "Informe de clasificación exportable",
      "Diseñado para flujos con SKUs recurrentes",
    ],
  },
  problem: {
    badge: "Problema",
    heading:
      "El trabajo aduanero por producto sigue atrapado en correos, hojas de cálculo y búsquedas frágiles.",
    cards: [
      {
        title: "Incertidumbre en la clasificación",
        body: "Los nombres de producto rara vez encajan limpiamente en un código HS. Kustaro fundamenta cada candidato en evidencia, una puntuación de confianza y marcas de revisión.",
      },
      {
        title: "Documentos faltantes",
        body: "Los certificados y pruebas de origen suelen aparecer en la frontera. Kustaro crea la lista de documentos antes del envío, no después.",
      },
      {
        title: "Preparación poco clara",
        body: "Aranceles, riesgos e información faltante suelen aparecer tras fijar el precio. Kustaro puntúa la preparación aduanera desde el principio para que sepas qué corregir.",
      },
    ],
  },
  workflow: {
    badge: "Cómo funciona",
    steps: [
      "Describe el producto en el asistente guiado",
      "Recibe candidatos de código HS con razonamiento y confianza",
      "Responde preguntas de información faltante para mejorar la confianza",
      "Exporta un informe de preparación aduanera para revisión",
    ],
  },
  customers: {
    badge: "Para quién",
    heading: "Para comercio con SKUs recurrentes en cualquier ruta, en todo el mundo.",
    rows: [
      "Importadores de Shopify y e-commerce",
      "Pequeños importadores/exportadores",
      "Equipos logísticos con SKUs recurrentes",
      "Agentes de aduanas en preclasificación",
    ],
  },
  example: {
    badge: "Ejemplo de resultado",
    heading: "Informes de preparación aduanera, no transcripciones de chatbot.",
    body: "Cada resultado incluye candidatos de código HS, puntuación de confianza, preguntas de información faltante, lista de documentos requeridos, alertas de riesgo y una puntuación de preparación aduanera sobre 100.",
    readiness: "Preparación aduanera",
    ready: "listo para revisión",
    actions: ["Confirmar el candidato HS", "Reunir prueba de origen", "Responder 3 preguntas abiertas"],
    planText:
      "Ejemplo de camiseta de algodón: 6109.10 es el candidato recomendado con 84 % de confianza; el certificado de origen no está confirmado y un código alternativo sigue siendo plausible — preparación 78/100, con las preguntas abiertas listadas para revisión.",
  },
  pricingPreview: {
    badge: "Vista previa de precios",
    heading: "Empieza gratis y sube de plan cuando crezcan los SKUs.",
    plans: {
      free: "3 clasificaciones gratis al mes — sin tarjeta.",
      starter: "50 clasificaciones con biblioteca de SKU y exportaciones.",
      pro: "250 clasificaciones, carga masiva beta e historial completo.",
    },
  },
  disclaimer:
    "Nota de cumplimiento: los resultados de Kustaro son recomendaciones de preparación aduanera generadas a partir de la información disponible del producto y datos de referencia arancelaria. No son asesoría legal ni garantizan la aceptación por las autoridades aduaneras. La clasificación final y las declaraciones deben verificarse antes de su uso oficial.",
  footer: {
    tagline:
      "Kustaro ofrece recomendaciones de preparación aduanera generadas a partir de información del producto y datos de referencia arancelaria. No es asesoría legal ni garantiza la aceptación por las autoridades aduaneras. Verifica la clasificación final y las declaraciones antes del uso oficial.",
    pricing: "Precios",
    login: "Iniciar sesión",
    signup: "Regístrate",
  },
  legal: {
    privacy: "Política de Privacidad",
    terms: "Términos del Servicio",
    lastUpdated: "Última actualización",
    authoritativeNote:
      "Este documento se proporciona en inglés. La versión en inglés es el texto vinculante; las traducciones de la interfaz no lo modifican.",
    consentPrefix: "Al crear una cuenta, aceptas",
    and: "y",
  },
  auth: {
    loginTitle: "Bienvenido de nuevo",
    loginSubtitle: "Inicia sesión en tu espacio de trabajo de Kustaro.",
    signupTitle: "Crea tu espacio de trabajo",
    signupSubtitle:
      "Clasifica tu primer producto en minutos. El espacio se crea automáticamente — sin tarjeta de crédito.",
    fullName: "Nombre completo",
    email: "Correo de trabajo",
    password: "Contraseña",
    createAccount: "Crear cuenta",
    login: "Iniciar sesión",
    haveAccount: "¿Ya tienes una cuenta?",
    noAccount: "¿Nuevo en Kustaro?",
    checkEmail: "Revisa tu correo para confirmar tu cuenta y luego inicia sesión.",
  },
  language: "Idioma",
  pricing: {
    badge: "Precios",
    title: "Planes autoservicio que escalan con tus SKUs.",
    subtitle:
      "Todos los planes producen los mismos candidatos HS, puntuaciones de preparación e informes exportables — mejora tu plan por volumen, biblioteca de SKU, carga masiva y funciones de equipo.",
    mostPopular: "Más popular",
    perMonth: "/mes",
    starting: "desde",
    meteringBadge: "API",
    meteringTitle: "API de Kustaro — lista de espera.",
    meteringBody:
      "La API de Kustaro permitirá a los equipos clasificar productos, obtener informes de preparación aduanera e integrar flujos de candidatos HS en sistemas internos. Contáctanos para acceso anticipado.",
    howItWorks: "Cómo funcionan los límites",
    notePre: "Cada",
    notePost:
      "clasificación cuenta como un crédito de tu límite mensual y se registra como evento de uso.",
    tiles: [
      "1 producto = 1 crédito de clasificación",
      "Los límites se reinician cada mes",
      "Las clasificaciones antiguas siguen visibles",
    ],
    plans: {
      free: {
        desc: "Prueba Kustaro con tus primeros productos.",
        cta: "Empieza gratis",
        features: [
          "3 clasificaciones / mes",
          "Asistente guiado de clasificación",
          "Puntuación de preparación aduanera",
          "Exportación básica (Markdown / JSON)",
        ],
      },
      starter: {
        desc: "Para pequeños importadores con SKUs recurrentes.",
        cta: "Elegir Starter",
        features: [
          "50 clasificaciones / mes",
          "Biblioteca de SKU guardados",
          "Historial de clasificaciones",
          "Exportar informes",
        ],
      },
      pro: {
        desc: "Para marcas en crecimiento con volumen.",
        cta: "Elegir Pro",
        features: [
          "250 clasificaciones / mes",
          "Carga masiva (beta)",
          "Exportaciones PDF / CSV",
          "Historial de clasificaciones",
          "Biblioteca de SKU guardados",
        ],
      },
      business: {
        desc: "Para equipos que clasifican cada envío.",
        cta: "Elegir Business",
        features: [
          "1.000 clasificaciones / mes",
          "Espacio de trabajo de equipo",
          "Acceso a la API",
          "Límites prioritarios",
          "Carga masiva (beta)",
        ],
      },
      forwarder: {
        desc: "Para transitarios y agentes con volumen a medida.",
        cta: "Habla con nosotros",
        features: [
          "Volumen a medida",
          "Espacio de trabajo de equipo",
          "Acceso a la API",
          "Flujos personalizados",
          "Soporte de incorporación",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Espacio de preparación aduanera",
      newPlan: "Nueva clasificación",
      nav: {
        dashboard: "Panel",
        plans: "Clasificaciones",
        products: "Productos",
        bulkUpload: "Carga masiva",
        apiKeys: "Claves API",
        billing: "Planes",
      },
    },
    topbar: {
      plan: "plan",
      upgrade: "Mejorar",
      signOut: "Cerrar sesión",
    },
    plansTitle: "Clasificaciones",
    plansSubtitle: "Todas las clasificaciones de tu espacio de trabajo.",
    wizard: {
      newTitle: "Clasificar un producto",
      newSubtitle:
        "Datos guiados de entrada, preparación aduanera de salida: candidatos HS con razonamiento, puntuación de confianza, preguntas abiertas, lista de documentos, alertas de riesgo e informe exportable.",
      steps: ["Producto", "Datos", "Ruta comercial", "Documentos", "Generar"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      prefill: "Rellenar una demo:",
      demoTshirt: "Camiseta de algodón",
      demoBattery: "Batería de e-bike",
      quickFind: "Búsqueda rápida",
      quickFindPlaceholder: "p. ej. S-Works Tarmac SL9",
      quickFindHelp:
        "Escribe marca + modelo y completaremos descripción, material, uso, categoría, marca, modelo y peso unitario.",
      quickFindConfirm:
        "Los campos de abajo ya son editables (el peso unitario, en el paso de ruta, también viene rellenado) — revísalos, corrige lo necesario y confirma antes de continuar.",
      quickFindNudge: "Confirma que los datos son correctos antes de continuar.",
      optional: "(opcional)",
      select: "Selecciona…",
      fields: {
        productName: "Nombre del producto",
        productDescription: "Descripción del producto",
        material: "Material / composición",
        intendedUse: "Uso previsto",
        category: "Categoría",
        brand: "Marca",
        model: "Modelo",
        sku: "SKU",
        originCountry: "País de origen",
        destinationCountry: "País de destino",
        supplierCountry: "País del proveedor",
        shippingMethod: "Método de envío",
        declaredValue: "Valor declarado",
        currency: "Moneda",
        quantity: "Cantidad",
        unitWeight: "Peso unitario (kg)",
        invoiceText: "Texto de la factura (pegar)",
        specText: "Texto de especificaciones (pegar)",
        certificate: "Hay certificado de origen disponible para este producto",
      },
      factsIntro: "¿Cuáles de estas describen el producto?",
      factsHint:
        "Estas marcas dirigen las categorías de alto riesgo (baterías, alimentos, cosméticos, químicos, médicos, doble uso…) a los controles y documentos correctos.",
      flags: {
        is_textile: "Producto textil",
        is_electronics: "Electrónica",
        contains_battery: "Contiene batería",
        is_food: "Producto alimenticio",
        is_cosmetic: "Producto cosmético",
        is_medical_or_health_related: "Médico / relacionado con la salud",
        is_chemical: "Producto químico",
        is_dual_use_or_restricted: "Doble uso o restringido",
      },
      invoicePlaceholder: "Pega aquí las líneas de la factura comercial (opcional)…",
      specPlaceholder: "Pega aquí el texto de la ficha técnica (opcional)…",
      supplierHint:
        "Donde compras o desde donde envías — indícalo solo si difiere del país de origen (fabricación). Una discrepancia añade un punto de control de prueba de origen.",
      roadUnavailable:
        "La carretera no está disponible en esta ruta — no hay conexión terrestre entre estos países.",
      methods: {
        sea: "Flete marítimo",
        air: "Flete aéreo",
        road: "Carretera",
        roadNoRoute: "Carretera (sin ruta terrestre)",
        courier: "Mensajería / paquete",
      },
      documentsIntro:
        "Opcionalmente pega texto de factura o especificaciones e indica certificados disponibles — mejoran la evaluación de preparación. La subida de archivos captura solo metadatos por ahora (la extracción completa llegará pronto).",
      clickToSelect: "Haz clic para seleccionar archivos",
      fileTypes: "PDF, texto, imágenes",
      reviewTitle: "Revisar y generar",
      reviewProduct: "Producto",
      reviewTradeLane: "Ruta comercial",
      reviewDocuments: "Documentos adjuntos",
      reviewFlags: "Datos del producto",
      reviewNote:
        "Normalizaremos la descripción, recuperaremos códigos candidatos, razonaremos sobre ellos y produciremos un informe de preparación aduanera con puntuación de confianza. Los artículos de alto riesgo o baja confianza se marcan para revisión.",
      confirmRecommendation:
        "Entiendo que este resultado es una recomendación de preparación aduanera para revisión — no una clasificación aduanera definitiva ni asesoría legal.",
      confirmNudge: "Confirma la nota de solo-recomendación antes de generar.",
      back: "Atrás",
      continue: "Continuar",
      classify: "Generar clasificación",
    },
  },
};
