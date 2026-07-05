import type { Messages } from "./en";

export const fr: Messages = {
  nav: {
    workflow: "Comment ça marche",
    customers: "Pour qui",
    pricing: "Tarifs",
    login: "Connexion",
    signup: "Inscription gratuite",
  },
  hero: {
    badge: "Espace de préparation douanière en libre-service",
    headline: "Classez vos produits pour la douane avant l'expédition.",
    description:
      "Générez des candidats de code SH, des questions sur les informations manquantes, des check-lists documentaires, des alertes de risque et des rapports de préparation douanière directement dans votre navigateur.",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Importer une liste de SKU",
    trust:
      "Conçu pour les importateurs, exportateurs, marques e-commerce et équipes logistiques gérant des SKU récurrents.",
  },
  compare: {
    badge: "Pourquoi Kustaro",
    heading: "Bien plus qu'une simple estimation de code SH.",
    genericTitle: "Outils tarifaires IA génériques",
    kustaroTitle: "Kustaro",
    genericRows: [
      "Une seule zone de texte",
      "Renvoie un code",
      "Pas d'amélioration de la confiance",
      "Pas de bibliothèque de SKU enregistrés",
      "Pas de flux de préparation",
      "Export/reporting faibles",
      "Difficile à réutiliser pour les produits récurrents",
    ],
    kustaroRows: [
      "Assistant de classification guidé",
      "Candidats de code SH avec raisonnement",
      "Questions d'informations manquantes pour améliorer la confiance",
      "Score de préparation douanière",
      "Bibliothèque de produits/SKU enregistrés",
      "Rapport de classification exportable",
      "Conçu pour les flux de SKU récurrents",
    ],
  },
  problem: {
    badge: "Problème",
    heading:
      "Le travail douanier au niveau produit reste enfermé dans les e-mails, les tableurs et des recherches fragiles.",
    cards: [
      {
        title: "Incertitude de classification",
        body: "Les intitulés produits correspondent rarement à un code SH. Kustaro fonde chaque candidat sur des preuves, un score de confiance et des indicateurs de revue.",
      },
      {
        title: "Documents manquants",
        body: "Les certificats et preuves d'origine apparaissent souvent à la frontière. Kustaro établit la check-list documentaire avant l'expédition, pas après.",
      },
      {
        title: "Préparation incertaine",
        body: "Droits, risques et informations manquantes surgissent souvent après la tarification. Kustaro note la préparation douanière dès le départ : vous savez quoi corriger.",
      },
    ],
  },
  workflow: {
    badge: "Comment ça marche",
    steps: [
      "Décrivez le produit dans l'assistant guidé",
      "Recevez des candidats de code SH avec raisonnement et confiance",
      "Répondez aux questions manquantes pour améliorer la confiance",
      "Exportez un rapport de préparation douanière pour revue",
    ],
  },
  customers: {
    badge: "Pour qui",
    heading: "Pour le commerce de SKU récurrents sur toutes les routes, partout dans le monde.",
    rows: [
      "Importateurs Shopify et e-commerce",
      "Petits importateurs/exportateurs",
      "Équipes logistiques gérant des SKU récurrents",
      "Courtiers en pré-classification",
    ],
  },
  example: {
    badge: "Exemple de résultat",
    heading: "Des rapports de préparation douanière, pas des transcriptions de chatbot.",
    body: "Chaque résultat comprend des candidats de code SH, un score de confiance, des questions d'informations manquantes, une check-list de documents requis, des alertes de risque et un score de préparation douanière sur 100.",
    readiness: "Préparation douanière",
    ready: "prêt pour revue",
    actions: ["Confirmer le candidat SH", "Réunir la preuve d'origine", "Répondre à 3 questions ouvertes"],
    planText:
      "Exemple t-shirt en coton : 6109.10 est le candidat recommandé à 84 % de confiance ; le certificat d'origine n'est pas confirmé et un code alternatif reste plausible — préparation 78/100, questions ouvertes listées pour revue.",
  },
  pricingPreview: {
    badge: "Aperçu des tarifs",
    heading: "Commencez gratuitement, évoluez avec vos SKU.",
    plans: {
      free: "3 classifications gratuites par mois — sans carte.",
      starter: "50 classifications avec bibliothèque de SKU et exports.",
      pro: "250 classifications, import en masse bêta et historique complet.",
    },
  },
  disclaimer:
    "Note de conformité : les résultats Kustaro sont des recommandations de préparation douanière générées à partir des informations produit disponibles et de données tarifaires de référence. Ils ne constituent pas un avis juridique et ne garantissent pas l'acceptation par les autorités douanières. La classification finale et les déclarations doivent être vérifiées avant tout usage officiel.",
  footer: {
    tagline:
      "Kustaro fournit des recommandations de préparation douanière générées à partir des informations produit et de données tarifaires de référence. Ce n'est pas un avis juridique et cela ne garantit pas l'acceptation par les autorités douanières. Vérifiez la classification finale et les déclarations avant usage officiel.",
    pricing: "Tarifs",
    login: "Connexion",
    signup: "Inscription",
  },
  legal: {
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    lastUpdated: "Dernière mise à jour",
    authoritativeNote:
      "Ce document est fourni en anglais. La version anglaise fait foi ; les traductions de l'interface ne la modifient pas.",
    consentPrefix: "En créant un compte, vous acceptez",
    and: "et",
  },
  auth: {
    loginTitle: "Bon retour",
    loginSubtitle: "Connectez-vous à votre espace Kustaro.",
    signupTitle: "Créez votre espace de travail",
    signupSubtitle:
      "Classez votre premier produit en quelques minutes. L'espace est créé automatiquement — sans carte bancaire.",
    fullName: "Nom complet",
    email: "E-mail professionnel",
    password: "Mot de passe",
    createAccount: "Créer un compte",
    login: "Connexion",
    haveAccount: "Vous avez déjà un compte ?",
    noAccount: "Nouveau sur Kustaro ?",
    checkEmail: "Vérifiez votre e-mail pour confirmer votre compte, puis connectez-vous.",
  },
  language: "Langue",
  pricing: {
    badge: "Tarifs",
    title: "Des offres en libre-service qui évoluent avec vos SKU.",
    subtitle:
      "Chaque offre produit les mêmes candidats SH, scores de préparation et rapports exportables — passez au niveau supérieur pour le volume, la bibliothèque SKU, l'import en masse et les fonctions d'équipe.",
    mostPopular: "Le plus populaire",
    perMonth: "/mois",
    starting: "à partir de",
    meteringBadge: "API",
    meteringTitle: "API Kustaro — liste d'attente.",
    meteringBody:
      "L'API Kustaro permettra aux équipes de classer des produits, de récupérer des rapports de préparation douanière et d'intégrer les flux de candidats SH dans leurs systèmes internes. Contactez-nous pour un accès anticipé.",
    howItWorks: "Fonctionnement des limites",
    notePre: "Chaque",
    notePost:
      "classification compte comme un crédit sur votre limite mensuelle et est enregistrée comme événement d'usage.",
    tiles: [
      "1 produit = 1 crédit de classification",
      "Limites réinitialisées chaque mois",
      "Les anciennes classifications restent consultables",
    ],
    plans: {
      free: {
        desc: "Essayez Kustaro sur vos premiers produits.",
        cta: "Commencer gratuitement",
        features: [
          "3 classifications / mois",
          "Assistant de classification guidé",
          "Score de préparation douanière",
          "Export basique (Markdown / JSON)",
        ],
      },
      starter: {
        desc: "Pour les petits importateurs aux SKU récurrents.",
        cta: "Choisir Starter",
        features: [
          "50 classifications / mois",
          "Bibliothèque de SKU enregistrés",
          "Historique des classifications",
          "Export des rapports",
        ],
      },
      pro: {
        desc: "Pour les marques en croissance à fort volume.",
        cta: "Choisir Pro",
        features: [
          "250 classifications / mois",
          "Import en masse (bêta)",
          "Exports PDF / CSV",
          "Historique des classifications",
          "Bibliothèque de SKU enregistrés",
        ],
      },
      business: {
        desc: "Pour les équipes qui classent chaque expédition.",
        cta: "Choisir Business",
        features: [
          "1 000 classifications / mois",
          "Espace de travail d'équipe",
          "Accès API",
          "Limites prioritaires",
          "Import en masse (bêta)",
        ],
      },
      forwarder: {
        desc: "Pour transitaires et courtiers à volume sur mesure.",
        cta: "Parlons-en",
        features: [
          "Volume sur mesure",
          "Espace de travail d'équipe",
          "Accès API",
          "Flux personnalisés",
          "Accompagnement à l'intégration",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Espace de préparation douanière",
      newPlan: "Nouvelle classification",
      nav: {
        dashboard: "Tableau de bord",
        plans: "Classifications",
        products: "Produits",
        bulkUpload: "Import en masse",
        apiKeys: "Clés API",
        billing: "Offres",
      },
    },
    topbar: {
      plan: "offre",
      upgrade: "Améliorer",
      signOut: "Déconnexion",
    },
    plansTitle: "Classifications",
    plansSubtitle: "Toutes les classifications de votre espace de travail.",
    wizard: {
      newTitle: "Classer un produit",
      newSubtitle:
        "Des informations guidées en entrée, la préparation douanière en sortie : candidats SH avec raisonnement, score de confiance, questions ouvertes, check-list documentaire, alertes de risque et rapport exportable.",
      steps: ["Produit", "Caractéristiques", "Route commerciale", "Documents", "Générer"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      prefill: "Préremplir une démo :",
      demoTshirt: "T-shirt en coton",
      demoBattery: "Batterie d'e-bike",
      quickFind: "Recherche rapide",
      quickFindPlaceholder: "ex. S-Works Tarmac SL9",
      quickFindHelp:
        "Saisissez marque + modèle et nous remplirons la description, la matière, l'usage, la catégorie, la marque, le modèle et le poids unitaire.",
      quickFindConfirm:
        "Les champs ci-dessous sont désormais modifiables (le poids unitaire, à l'étape route, est aussi prérempli) — vérifiez-les, corrigez si besoin, puis confirmez avant de continuer.",
      quickFindNudge: "Veuillez confirmer l'exactitude des informations avant de continuer.",
      optional: "(facultatif)",
      select: "Sélectionner…",
      fields: {
        productName: "Nom du produit",
        productDescription: "Description du produit",
        material: "Matière / composition",
        intendedUse: "Usage prévu",
        category: "Catégorie",
        brand: "Marque",
        model: "Modèle",
        sku: "SKU",
        originCountry: "Pays d'origine",
        destinationCountry: "Pays de destination",
        supplierCountry: "Pays du fournisseur",
        shippingMethod: "Mode d'expédition",
        declaredValue: "Valeur déclarée",
        currency: "Devise",
        quantity: "Quantité",
        unitWeight: "Poids unitaire (kg)",
        invoiceText: "Texte de facture (coller)",
        specText: "Fiche technique (coller)",
        certificate: "Un certificat d'origine est disponible pour ce produit",
      },
      factsIntro: "Lesquelles de ces caractéristiques décrivent le produit ?",
      factsHint:
        "Ces indicateurs orientent les catégories à haut risque (batteries, alimentaire, cosmétiques, chimie, médical, double usage…) vers les bons contrôles et documents.",
      flags: {
        is_textile: "Produit textile",
        is_electronics: "Électronique",
        contains_battery: "Contient une batterie",
        is_food: "Produit alimentaire",
        is_cosmetic: "Produit cosmétique",
        is_medical_or_health_related: "Médical / lié à la santé",
        is_chemical: "Produit chimique",
        is_dual_use_or_restricted: "Double usage ou soumis à restriction",
      },
      invoicePlaceholder: "Collez ici les lignes de la facture commerciale (facultatif)…",
      specPlaceholder: "Collez ici le texte de la fiche technique (facultatif)…",
      supplierHint:
        "Là où vous achetez ou expédiez — à renseigner uniquement si différent du pays d'origine (fabrication). Un écart ajoute un point de contrôle de preuve d'origine.",
      roadUnavailable:
        "La route est indisponible sur ce trajet — aucune liaison terrestre entre ces pays.",
      methods: {
        sea: "Fret maritime",
        air: "Fret aérien",
        road: "Route",
        roadNoRoute: "Route (pas de liaison terrestre)",
        courier: "Coursier / colis",
      },
      documentsIntro:
        "Collez éventuellement le texte de facture ou de fiche technique et signalez les certificats disponibles — cela améliore l'évaluation de préparation. L'envoi de fichiers ne capture pour l'instant que les métadonnées (l'extraction complète arrive).",
      clickToSelect: "Cliquez pour sélectionner des fichiers",
      fileTypes: "PDF, texte, images",
      reviewTitle: "Vérifier et générer",
      reviewProduct: "Produit",
      reviewTradeLane: "Route commerciale",
      reviewDocuments: "Documents joints",
      reviewFlags: "Caractéristiques produit",
      reviewNote:
        "Nous normaliserons la description, récupérerons les codes candidats, raisonnerons dessus et produirons un rapport de préparation douanière avec score de confiance. Les articles à haut risque ou à faible confiance sont signalés pour revue.",
      confirmRecommendation:
        "Je comprends que ce résultat est une recommandation de préparation douanière destinée à la revue — ni une classification douanière définitive, ni un avis juridique.",
      confirmNudge: "Veuillez confirmer la mention « recommandation uniquement » avant de générer.",
      back: "Retour",
      continue: "Continuer",
      classify: "Générer la classification",
    },
  },
};
