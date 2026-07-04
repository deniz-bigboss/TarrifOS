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
  legal: {
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    lastUpdated: "Dernière mise à jour",
    authoritativeNote:
      "Ce document est fourni en anglais. La version anglaise fait foi ; les traductions de l'interface ne la modifient pas.",
    consentPrefix: "En créant un compte, vous acceptez les",
    and: "et la",
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
  app: {
    sidebar: {
      tagline: "Agent d'opérations d'expédition",
      newPlan: "Nouveau plan d'expédition",
      nav: {
        dashboard: "Tableau de bord",
        plans: "Plans d'expédition",
        apiKeys: "Clés API",
        billing: "Forfaits",
      },
    },
    topbar: {
      plan: "forfait",
      upgrade: "Améliorer",
      signOut: "Se déconnecter",
    },
    plansTitle: "Plans d'expédition",
    plansSubtitle: "Toutes les classifications exécutées par votre espace de travail.",
    wizard: {
      newTitle: "Nouvelle classification",
      newSubtitle:
        "Saisissez les détails du produit pour obtenir un code tarifaire recommandé avec preuves, score de confiance et rapport prêt pour le courtier.",
      steps: ["Produit", "Ligne commerciale", "Documents", "Vérification"],
      prefill: "Préremplir une démo :",
      demoTshirt: "T-shirt en coton",
      demoBattery: "Batterie de vélo électrique",
      quickFind: "Recherche rapide",
      quickFindPlaceholder: "ex. S-Works Tarmac SL9",
      quickFindHelp:
        "Saisissez marque + modèle et nous remplirons la description, la matière, l'usage, la catégorie, la marque, le modèle et le poids unitaire.",
      quickFindConfirm:
        "Les champs ci-dessous sont désormais modifiables (le poids unitaire, à l'étape suivante, est aussi prérempli) — vérifiez-les, corrigez ce qui doit l'être, puis confirmez avant de continuer.",
      quickFindNudge: "Veuillez confirmer que les informations sont correctes avant de continuer.",
      optional: "(facultatif)",
      select: "Sélectionner…",
      fields: {
        productName: "Nom du produit",
        productDescription: "Description du produit",
        material: "Matière / composition",
        intendedUse: "Usage prévu",
        category: "Catégorie",
        brand: "Marque",
        sku: "Modèle / SKU",
        originCountry: "Pays d'origine",
        destinationCountry: "Pays de destination",
        supplierCountry: "Pays du fournisseur",
        shippingMethod: "Mode d'expédition",
        declaredValue: "Valeur déclarée",
        currency: "Devise",
        quantity: "Quantité",
        unitWeight: "Poids unitaire (kg)",
      },
      supplierHint:
        "Le pays d'achat ou d'expédition — à renseigner uniquement s'il diffère du pays d'origine (fabrication). Un écart ajoute un point de contrôle de preuve d'origine à votre plan.",
      roadUnavailable:
        "La route n'est pas disponible pour cette ligne — il n'existe pas de liaison terrestre entre ces pays.",
      methods: {
        sea: "Fret maritime",
        air: "Fret aérien",
        road: "Route",
        roadNoRoute: "Route (pas de liaison terrestre)",
        courier: "Coursier / colis",
      },
      documentsIntro:
        "Joignez si vous le souhaitez des documents justificatifs (facture commerciale, liste de colisage, fiche fournisseur, catalogue). Pour l'instant, seules les métadonnées des fichiers sont enregistrées — l'extraction complète est provisoire et ne modifie pas encore la classification.",
      clickToSelect: "Cliquez pour sélectionner des fichiers",
      fileTypes: "PDF, texte, images",
      reviewTitle: "Vérifier et classer",
      reviewProduct: "Produit",
      reviewTradeLane: "Ligne commerciale",
      reviewDocuments: "Documents joints",
      reviewNote:
        "Nous normaliserons la description, récupérerons des codes candidats, raisonnerons dessus et produirons un rapport prêt pour le courtier avec un score de confiance. Les articles à haut risque ou à faible confiance sont signalés pour révision.",
      back: "Retour",
      continue: "Continuer",
      classify: "Classer le produit",
    },
  },
};
