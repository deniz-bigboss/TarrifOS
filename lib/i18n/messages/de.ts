import type { Messages } from "./en";

export const de: Messages = {
  nav: {
    workflow: "So funktioniert's",
    customers: "Für wen",
    pricing: "Preise",
    login: "Anmelden",
    signup: "Kostenlos registrieren",
  },
  hero: {
    badge: "Self-Service-Arbeitsbereich für Zollbereitschaft",
    headline: "Produkte für den Zoll klassifizieren — vor dem Versand.",
    description:
      "Erzeugen Sie HS-Code-Kandidaten, Fragen zu fehlenden Angaben, Dokumenten-Checklisten, Risikohinweise und Zollbereitschafts-Berichte direkt im Browser.",
    ctaPrimary: "Kostenlos klassifizieren",
    ctaSecondary: "SKU-Liste hochladen",
    trust:
      "Für Importeure, Exporteure, E-Commerce-Marken und Logistikteams mit wiederkehrenden SKUs.",
  },
  compare: {
    badge: "Warum Kustaro",
    heading: "Mehr als eine HS-Code-Vermutung.",
    genericTitle: "Generische KI-Tarif-Tools",
    kustaroTitle: "Kustaro",
    genericRows: [
      "Ein einziges Textfeld",
      "Gibt nur einen Code zurück",
      "Keine Verbesserung der Konfidenz",
      "Keine gespeicherte SKU-Bibliothek",
      "Kein Bereitschafts-Workflow",
      "Schwacher Export/Reporting",
      "Kaum wiederverwendbar für Wiederholprodukte",
    ],
    kustaroRows: [
      "Geführter Klassifizierungs-Assistent",
      "HS-Code-Kandidaten mit Begründung",
      "Fragen zu fehlenden Angaben erhöhen die Konfidenz",
      "Zollbereitschafts-Score",
      "Gespeicherte Produkt-/SKU-Bibliothek",
      "Exportierbarer Klassifizierungsbericht",
      "Für Workflows mit wiederkehrenden SKUs gebaut",
    ],
  },
  problem: {
    badge: "Problem",
    heading:
      "Zollarbeit auf Produktebene steckt noch immer in E-Mails, Tabellen und brüchigen Nachschlagewerken fest.",
    cards: [
      {
        title: "Unsichere Klassifizierung",
        body: "Produktnamen passen selten sauber auf einen HS-Code. Kustaro stützt jeden Kandidaten auf Belege, einen Konfidenz-Score und Prüfhinweise.",
      },
      {
        title: "Fehlende Dokumente",
        body: "Zertifikate und Ursprungsnachweise tauchen meist erst an der Grenze auf. Kustaro erstellt die Dokumenten-Checkliste vor dem Versand, nicht danach.",
      },
      {
        title: "Unklare Bereitschaft",
        body: "Zölle, Risiken und fehlende Angaben zeigen sich oft erst nach der Preiskalkulation. Kustaro bewertet die Zollbereitschaft vorab — Sie wissen, was zu tun ist.",
      },
    ],
  },
  workflow: {
    badge: "So funktioniert's",
    steps: [
      "Produkt im geführten Assistenten beschreiben",
      "HS-Code-Kandidaten mit Begründung und Konfidenz erhalten",
      "Fragen zu fehlenden Angaben beantworten und Konfidenz erhöhen",
      "Zollbereitschafts-Bericht zur Prüfung exportieren",
    ],
  },
  customers: {
    badge: "Für wen",
    heading: "Für wiederkehrende SKUs auf jeder Handelsroute, weltweit.",
    rows: [
      "Shopify- und E-Commerce-Importeure",
      "Kleine Importeure/Exporteure",
      "Logistikteams mit wiederkehrenden SKUs",
      "Zollagenten für die Vorklassifizierung",
    ],
  },
  example: {
    badge: "Beispiel-Ergebnis",
    heading: "Zollbereitschafts-Berichte statt Chatbot-Protokolle.",
    body: "Jedes Ergebnis enthält HS-Code-Kandidaten, einen Konfidenz-Score, Fragen zu fehlenden Angaben, eine Dokumenten-Checkliste, Risikohinweise und einen Zollbereitschafts-Score von 100.",
    readiness: "Zollbereitschaft",
    ready: "bereit zur Prüfung",
    actions: ["HS-Code-Kandidaten bestätigen", "Ursprungsnachweis einholen", "3 offene Fragen beantworten"],
    planText:
      "Beispiel Baumwoll-T-Shirt: 6109.10 ist der empfohlene Kandidat mit 84 % Konfidenz; das Ursprungszeugnis ist nicht bestätigt und ein Alternativcode bleibt plausibel — Bereitschaft 78/100, offene Fragen zur Prüfung gelistet.",
  },
  pricingPreview: {
    badge: "Preis-Vorschau",
    heading: "Kostenlos starten, bei mehr SKUs upgraden.",
    plans: {
      free: "3 kostenlose Klassifizierungen pro Monat — ohne Karte.",
      starter: "50 Klassifizierungen mit SKU-Bibliothek und Exporten.",
      pro: "250 Klassifizierungen, Bulk-Upload-Beta und volle Historie.",
    },
  },
  disclaimer:
    "Compliance-Hinweis: Kustaro-Ergebnisse sind Zollbereitschafts-Empfehlungen auf Basis verfügbarer Produktinformationen und Tarif-Referenzdaten. Sie sind keine Rechtsberatung und garantieren keine Anerkennung durch Zollbehörden. Endgültige Klassifizierung und Zollanmeldungen sind vor amtlicher Verwendung zu prüfen.",
  footer: {
    tagline:
      "Kustaro liefert Zollbereitschafts-Empfehlungen auf Basis von Produktinformationen und Tarif-Referenzdaten. Keine Rechtsberatung, keine Garantie der Anerkennung durch Zollbehörden. Endgültige Klassifizierung und Anmeldungen vor amtlicher Verwendung prüfen.",
    pricing: "Preise",
    login: "Anmelden",
    signup: "Registrieren",
  },
  legal: {
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    refunds: "Rückerstattungsrichtlinie",
    lastUpdated: "Zuletzt aktualisiert",
    authoritativeNote:
      "Dieses Dokument liegt auf Englisch vor. Die englische Fassung ist maßgeblich; Übersetzungen der Oberfläche ändern sie nicht.",
    consentPrefix: "Mit der Kontoerstellung stimmen Sie zu:",
    and: "und",
  },
  auth: {
    loginTitle: "Willkommen zurück",
    loginSubtitle: "Melden Sie sich in Ihrem Kustaro-Arbeitsbereich an.",
    signupTitle: "Arbeitsbereich erstellen",
    signupSubtitle:
      "Klassifizieren Sie Ihr erstes Produkt in Minuten. Der Arbeitsbereich wird automatisch angelegt — keine Kreditkarte nötig.",
    fullName: "Vollständiger Name",
    email: "Geschäftliche E-Mail",
    password: "Passwort",
    createAccount: "Konto erstellen",
    login: "Anmelden",
    haveAccount: "Bereits ein Konto?",
    noAccount: "Neu bei Kustaro?",
    checkEmail: "Bestätigen Sie Ihr Konto per E-Mail und melden Sie sich dann an.",
  },
  language: "Sprache",
  pricing: {
    badge: "Preise",
    title: "Self-Service-Pläne, die mit Ihren SKUs skalieren.",
    subtitle:
      "Jeder Plan liefert dieselben HS-Code-Kandidaten, Bereitschafts-Scores und exportierbaren Berichte — upgraden Sie für Volumen, SKU-Bibliothek, Bulk-Upload und Team-Funktionen.",
    mostPopular: "Am beliebtesten",
    perMonth: "/Monat",
    starting: "ab",
    meteringBadge: "API",
    meteringTitle: "Kustaro API — Warteliste.",
    meteringBody:
      "Die Kustaro API wird es Teams ermöglichen, Produkte zu klassifizieren, Zollbereitschafts-Berichte abzurufen und HS-Code-Workflows in interne Systeme zu integrieren. Kontaktieren Sie uns für frühen Zugang.",
    howItWorks: "So funktionieren Limits",
    notePre: "Jede",
    notePost:
      "Klassifizierung zählt als ein Guthaben auf Ihr Monatslimit und wird als Nutzungsereignis erfasst.",
    tiles: [
      "1 Produkt = 1 Klassifizierungs-Guthaben",
      "Limits werden monatlich zurückgesetzt",
      "Alte Klassifizierungen bleiben einsehbar",
    ],
    plans: {
      free: {
        desc: "Kustaro mit den ersten Produkten testen.",
        cta: "Kostenlos starten",
        features: [
          "3 Klassifizierungen / Monat",
          "Geführter Klassifizierungs-Assistent",
          "Zollbereitschafts-Score",
          "Basis-Export (Markdown / JSON)",
        ],
      },
      starter: {
        desc: "Für kleine Importeure mit wiederkehrenden SKUs.",
        cta: "Starter wählen",
        features: [
          "50 Klassifizierungen / Monat",
          "Gespeicherte SKU-Bibliothek",
          "Klassifizierungs-Historie",
          "Berichte exportieren",
        ],
      },
      pro: {
        desc: "Für wachsende Marken mit Volumen.",
        cta: "Pro wählen",
        features: [
          "250 Klassifizierungen / Monat",
          "Bulk-Upload (Beta)",
          "PDF- / CSV-Exporte",
          "Klassifizierungs-Historie",
          "Gespeicherte SKU-Bibliothek",
        ],
      },
      business: {
        desc: "Für Teams, die jede Sendung klassifizieren.",
        cta: "Business wählen",
        features: [
          "1.000 Klassifizierungen / Monat",
          "Team-Arbeitsbereich (Frühzugang)",
          "API-Zugang",
          "Priorisierte Limits",
          "Bulk-Upload (Beta)",
        ],
      },
      forwarder: {
        desc: "Für Spediteure und Agenten mit individuellem Volumen.",
        cta: "Kontakt aufnehmen",
        features: [
          "Individuelles Volumen",
          "Team-Arbeitsbereich (Frühzugang)",
          "API-Zugang",
          "Individuelle Workflows",
          "Onboarding-Support",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Zollbereitschafts-Arbeitsbereich",
      newPlan: "Neue Klassifizierung",
      nav: {
        dashboard: "Dashboard",
        plans: "Klassifizierungen",
        products: "Produkte",
        bulkUpload: "Bulk-Upload",
        apiKeys: "API-Schlüssel",
        billing: "Pläne",
      },
    },
    topbar: {
      plan: "Plan",
      upgrade: "Upgrade",
      signOut: "Abmelden",
    },
    plansTitle: "Klassifizierungen",
    plansSubtitle: "Alle Klassifizierungen Ihres Arbeitsbereichs.",
    wizard: {
      newTitle: "Produkt klassifizieren",
      newSubtitle:
        "Geführte Angaben rein, Zollbereitschaft raus: HS-Code-Kandidaten mit Begründung, Konfidenz-Score, offene Fragen, Dokumenten-Checkliste, Risikohinweise und exportierbarer Bericht.",
      steps: ["Produkt", "Fakten", "Handelsroute", "Dokumente", "Erzeugen"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      prefill: "Demo laden:",
      demoTshirt: "Baumwoll-T-Shirt",
      demoBattery: "E-Bike-Akku",
      quickFind: "Schnellsuche",
      quickFindPlaceholder: "z. B. S-Works Tarmac SL9",
      quickFindHelp:
        "Marke + Modell eingeben — wir füllen Beschreibung, Material, Verwendung, Kategorie, Marke, Modell und Stückgewicht aus.",
      quickFindConfirm:
        "Die Felder unten sind jetzt bearbeitbar (das Stückgewicht im Routen-Schritt ist ebenfalls vorausgefüllt) — prüfen, korrigieren und vor dem Fortfahren bestätigen.",
      quickFindNudge: "Bitte bestätigen Sie die Angaben, bevor Sie fortfahren.",
      optional: "(optional)",
      select: "Auswählen…",
      fields: {
        productName: "Produktname",
        productDescription: "Produktbeschreibung",
        material: "Material / Zusammensetzung",
        intendedUse: "Verwendungszweck",
        category: "Kategorie",
        brand: "Marke",
        model: "Modell",
        sku: "SKU",
        originCountry: "Ursprungsland",
        destinationCountry: "Zielland",
        supplierCountry: "Lieferantenland",
        shippingMethod: "Versandart",
        declaredValue: "Deklarierter Wert",
        currency: "Währung",
        quantity: "Menge",
        unitWeight: "Stückgewicht (kg)",
        invoiceText: "Rechnungstext (einfügen)",
        specText: "Produktspezifikation (einfügen)",
        certificate: "Für dieses Produkt liegt ein Ursprungszeugnis vor",
      },
      factsIntro: "Welche dieser Eigenschaften treffen zu?",
      factsHint:
        "Diese Angaben leiten Hochrisiko-Kategorien (Akkus, Lebensmittel, Kosmetik, Chemie, Medizin, Dual-Use…) zu den richtigen Prüfungen und Dokumenten.",
      flags: {
        is_textile: "Textilprodukt",
        is_electronics: "Elektronik",
        contains_battery: "Enthält einen Akku/Batterie",
        is_food: "Lebensmittel",
        is_cosmetic: "Kosmetikprodukt",
        is_medical_or_health_related: "Medizin- / Gesundheitsbezug",
        is_chemical: "Chemisches Produkt",
        is_dual_use_or_restricted: "Dual-Use oder beschränkt",
      },
      invoicePlaceholder: "Positionen der Handelsrechnung hier einfügen (optional)…",
      specPlaceholder: "Text der Produktspezifikation hier einfügen (optional)…",
      supplierHint:
        "Wo Sie kaufen oder versenden — nur setzen, wenn abweichend vom Ursprungsland (Herstellung). Eine Abweichung fügt einen Ursprungsnachweis-Checkpoint hinzu.",
      roadUnavailable:
        "Straße ist auf dieser Route nicht verfügbar — es gibt keine Landverbindung zwischen diesen Ländern.",
      methods: {
        sea: "Seefracht",
        air: "Luftfracht",
        road: "Straße",
        roadNoRoute: "Straße (keine Landverbindung)",
        courier: "Kurier / Paket",
      },
      documentsIntro:
        "Optional Rechnungs- oder Spezifikationstext einfügen und vorhandene Zertifikate angeben — das verbessert die Bereitschafts-Bewertung. Datei-Upload erfasst vorerst nur Metadaten (vollständige Extraktion folgt).",
      clickToSelect: "Zum Auswählen klicken",
      fileTypes: "PDF, Text, Bilder",
      reviewTitle: "Prüfen & erzeugen",
      reviewProduct: "Produkt",
      reviewTradeLane: "Handelsroute",
      reviewDocuments: "Angehängte Dokumente",
      reviewFlags: "Produktfakten",
      reviewNote:
        "Wir normalisieren die Beschreibung, rufen Kandidaten-Codes ab, bewerten sie und erstellen einen Zollbereitschafts-Bericht mit Konfidenz-Score. Hochriskante oder unsichere Positionen werden zur Prüfung markiert.",
      confirmRecommendation:
        "Ich verstehe, dass dieses Ergebnis eine Zollbereitschafts-Empfehlung zur Prüfung ist — keine endgültige Zollklassifizierung und keine Rechtsberatung.",
      confirmNudge: "Bitte bestätigen Sie den Empfehlungs-Hinweis vor dem Erzeugen.",
      back: "Zurück",
      continue: "Weiter",
      classify: "Klassifizierung erzeugen",
    },
  },
};
