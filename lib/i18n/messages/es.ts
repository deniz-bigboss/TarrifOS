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
};
