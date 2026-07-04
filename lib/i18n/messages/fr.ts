import type { Messages } from "./en";

export const fr: Messages = {
  nav: {
    workflow: "Fonctionnement",
    customers: "Clients",
    pricing: "Tarifs",
    login: "Se connecter",
    signup: "Inscription gratuite",
  },
  hero: {
    badge: "Agent d'opérations d'expédition par IA",
    description:
      "Un espace de travail assisté par IA pour les importateurs et exportateurs qui transforme les données produit en recommandations de codes SH, listes de documents, points de contrôle de conformité, actions d'économie et plans d'exécution d'expédition.",
    ctaPrimary: "Créer un plan d'expédition",
    ctaSecondary: "Voir les tarifs",
  },
  problem: {
    badge: "Problème",
    heading:
      "Le travail douanier au niveau du produit reste piégé dans les e-mails, les tableurs et des recherches fragiles.",
    cards: [
      {
        title: "Incertitude de classification",
        body: "Les intitulés de produit correspondent rarement clairement à un code SH. TariffOS fonde chaque recommandation sur des preuves, des scores de confiance et des étapes de révision.",
      },
      {
        title: "Documents manquants",
        body: "Les certificats et preuves d'origine apparaissent souvent à la frontière. TariffOS établit la liste des documents avant la réservation, pas après.",
      },
      {
        title: "Mauvaises surprises de coût tardives",
        body: "Droits, TVA et frais surgissent souvent après la fixation du prix. TariffOS les estime en amont et propose des leviers d'économie légitimes.",
      },
    ],
  },
  workflow: {
    badge: "Comment ça marche",
    steps: [
      "Normaliser les données produit et la ligne commerciale",
      "Récupérer des codes SH candidats avec preuves",
      "Générer les contrôles de documents et de conformité",
      "Produire des actions de coût et un plan d'expédition",
    ],
  },
  customers: {
    badge: "Pour qui",
    heading:
      "Conçu pour le commerce de SKU récurrents sur toute ligne, partout dans le monde.",
    rows: [
      "Importateurs Shopify et e-commerce",
      "Petits importateurs/exportateurs",
      "Transitaires gérant des SKU récurrents",
      "Courtiers en douane effectuant la pré-classification",
    ],
  },
  example: {
    badge: "Exemple de résultat",
    heading: "Des plans d'exécution d'expédition, pas des transcriptions de chatbot.",
    body: "Chaque résultat inclut les codes candidats, la confiance, les informations manquantes, les documents requis, les avertissements, les actions à venir, les points de contrôle de conformité et les leviers de réduction des coûts.",
    readiness: "Préparation de l'expédition",
    ready: "prêt avec révision",
    actions: ["Confirmer le code SH", "Réunir la preuve d'origine", "Comparer les devis de fret"],
    planText:
      "Plan de l'agent pour une expédition de t-shirts en coton : utiliser 6109.10 comme classification de travail, réunir la facture et la preuve d'origine, valider la base de valeur et comparer les options de transport avant de réserver.",
  },
  pricingPreview: {
    badge: "Aperçu des tarifs",
    heading: "Commencez modestement, montez au volume d'API.",
    plans: {
      free: "Essayez TariffOS avec des classifications manuelles.",
      starter: "Pour les petits importateurs expédiant des SKU récurrents.",
      growth: "Pour les marques et équipes en croissance qui ont besoin de l'API.",
    },
  },
  disclaimer:
    "Avertissement de conformité : les résultats de TariffOS sont des recommandations générées à partir des informations produit et des données tarifaires disponibles. Ils ne constituent pas un conseil juridique. La classification finale, le traitement des droits et les déclarations en douane doivent être confirmés par un courtier en douane qualifié ou l'autorité douanière.",
  footer: {
    tagline:
      "TariffOS fournit des recommandations de classification générées à partir des informations produit et des données tarifaires. Ce n'est pas un conseil juridique. La classification finale et le traitement des droits doivent être confirmés par un courtier en douane qualifié ou l'autorité douanière.",
    pricing: "Tarifs",
    login: "Se connecter",
    signup: "S'inscrire",
  },
  auth: {
    loginTitle: "Bon retour",
    loginSubtitle: "Connectez-vous à votre espace de travail TariffOS.",
    signupTitle: "Créez votre espace de travail",
    signupSubtitle:
      "Créez votre premier plan d'expédition en quelques minutes. L'espace de travail est créé automatiquement — sans carte bancaire.",
    fullName: "Nom complet",
    email: "E-mail professionnel",
    password: "Mot de passe",
    createAccount: "Créer un compte",
    login: "Se connecter",
    haveAccount: "Vous avez déjà un compte ?",
    noAccount: "Nouveau sur TariffOS ?",
    checkEmail: "Vérifiez votre e-mail pour confirmer votre compte, puis connectez-vous.",
  },
  language: "Langue",
};
