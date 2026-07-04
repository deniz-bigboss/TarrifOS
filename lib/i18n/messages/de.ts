import type { Messages } from "./en";

export const de: Messages = {
  nav: {
    workflow: "Ablauf",
    customers: "Kunden",
    pricing: "Preise",
    login: "Anmelden",
    signup: "Kostenlos registrieren",
  },
  hero: {
    badge: "KI-Agent für Versandabläufe",
    description:
      "Ein KI-gestützter Arbeitsbereich für Importeure und Exporteure, der Produktdaten in HS-Empfehlungen, Dokumenten-Checklisten, Compliance-Prüfpunkte, kostensparende Maßnahmen und Versand-Ausführungspläne verwandelt.",
    ctaPrimary: "Versandplan erstellen",
    ctaSecondary: "Preise ansehen",
  },
  problem: {
    badge: "Problem",
    heading:
      "Zollarbeit auf Produktebene steckt noch immer in E-Mails, Tabellen und fehleranfälligen Recherchen fest.",
    cards: [
      {
        title: "Klassifizierungsunsicherheit",
        body: "Produktbezeichnungen passen selten eindeutig zu einem HS-Code. TariffOS stützt jede Empfehlung auf Belege, Konfidenzwerte und Prüfschritte.",
      },
      {
        title: "Fehlende Dokumente",
        body: "Zertifikate und Ursprungsnachweise tauchen meist erst an der Grenze auf. TariffOS erstellt die Dokumenten-Checkliste vor der Buchung, nicht danach.",
      },
      {
        title: "Späte Kostenüberraschungen",
        body: "Zoll, Mehrwertsteuer und Gebühren erscheinen oft erst nach der Preisfindung. TariffOS schätzt sie im Voraus und schlägt legitime Sparhebel vor.",
      },
    ],
  },
  workflow: {
    badge: "So funktioniert es",
    steps: [
      "Produkt- und Handelsroutendaten normalisieren",
      "HS-Code-Kandidaten mit Belegen abrufen",
      "Dokumenten- und Compliance-Prüfpunkte erzeugen",
      "Kostenmaßnahmen und einen Versandplan erstellen",
    ],
  },
  customers: {
    badge: "Für wen",
    heading:
      "Gebaut für den Handel mit wiederkehrenden SKUs auf jeder Route, überall auf der Welt.",
    rows: [
      "Shopify- und E-Commerce-Importeure",
      "Kleine Importeure/Exporteure",
      "Spediteure mit wiederkehrenden SKUs",
      "Zollagenten für die Vorklassifizierung",
    ],
  },
  example: {
    badge: "Beispielausgabe",
    heading: "Versand-Ausführungspläne, keine Chatbot-Protokolle.",
    body: "Jedes Ergebnis enthält Kandidatencodes, Konfidenz, fehlende Angaben, erforderliche Dokumente, Warnungen, nächste Schritte, Compliance-Prüfpunkte und Hebel zur Kostensenkung.",
    readiness: "Versandbereitschaft",
    ready: "bereit mit Prüfung",
    actions: ["HS-Code bestätigen", "Ursprungsnachweis einholen", "Frachtangebote vergleichen"],
    planText:
      "Agentenplan für eine Baumwoll-T-Shirt-Sendung: 6109.10 als Arbeitsklassifizierung verwenden, Rechnung und Ursprungsnachweis einholen, Wertbasis prüfen und Frachtoptionen vor der Buchung vergleichen.",
  },
  pricingPreview: {
    badge: "Preisvorschau",
    heading: "Klein anfangen, auf API-Volumen skalieren.",
    plans: {
      free: "Testen Sie TariffOS mit manuellen Klassifizierungen.",
      starter: "Für kleine Importeure mit wiederkehrenden SKUs.",
      growth: "Für wachsende Marken und Teams, die die API benötigen.",
    },
  },
  disclaimer:
    "Compliance-Hinweis: TariffOS-Ausgaben sind Empfehlungen, die aus verfügbaren Produkt- und Tarifdaten erzeugt werden. Sie sind keine Rechtsberatung. Endgültige Klassifizierung, Zollbehandlung und Zollanmeldungen sollten von einem qualifizierten Zollagenten oder der Zollbehörde bestätigt werden.",
  footer: {
    tagline:
      "TariffOS liefert Klassifizierungsempfehlungen aus Produkt- und Tarifdaten. Dies ist keine Rechtsberatung. Endgültige Klassifizierung und Zollbehandlung müssen von einem qualifizierten Zollagenten oder der Zollbehörde bestätigt werden.",
    pricing: "Preise",
    login: "Anmelden",
    signup: "Registrieren",
  },
  auth: {
    loginTitle: "Willkommen zurück",
    loginSubtitle: "Melden Sie sich in Ihrem TariffOS-Arbeitsbereich an.",
    signupTitle: "Erstellen Sie Ihren Arbeitsbereich",
    signupSubtitle:
      "Erstellen Sie Ihren ersten Versandplan in wenigen Minuten. Der Arbeitsbereich wird automatisch erstellt — keine Kreditkarte erforderlich.",
    fullName: "Vollständiger Name",
    email: "Geschäftliche E-Mail",
    password: "Passwort",
    createAccount: "Konto erstellen",
    login: "Anmelden",
    haveAccount: "Sie haben bereits ein Konto?",
    noAccount: "Neu bei TariffOS?",
    checkEmail: "Prüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen, und melden Sie sich dann an.",
  },
  language: "Sprache",
};
