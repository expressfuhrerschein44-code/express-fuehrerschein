/**
 * Express-Führerschein
 * Complete public Home data composition.
 *
 * Default copy: German.
 *
 * This file composes the Home from smaller data modules so the page can later
 * migrate to API/CMS data without rewriting presentation components.
 */

import {
  ASSETS,
  HOME_SECTION_IDS,
  ROUTES,
} from "@/lib/constants";
import type { HomePageData } from "@/types/home";

import { HOME_COUNTRIES } from "@/data/countries";
import { HOME_FOOTER_DATA } from "@/data/footer";
import { HOME_LICENSE_CLASSES } from "@/data/license-classes";
import { HOME_HEADER_DATA } from "@/data/navigation";

export const HOME_DATA = {
  header: HOME_HEADER_DATA,

  hero: {
    badge: "DEUTSCHLANDS FÜHRENDE ONLINE-PLATTFORM",

    title: "Dein Führerschein.",

    highlight: "Schnell. Sicher. In 21 Tagen.",

    description:
      "Die komplette Vorbereitung auf die theoretische Prüfung – strukturiert, effizient und garantiert zum Erfolg.",

    benefits: [
      {
        id: "all-classes",
        label: "Alle Klassen",
        icon: {
          name: "check",
          ariaHidden: true,
        },
      },
      {
        id: "exam-guarantee",
        label: "Prüfungsgarantie",
        icon: {
          name: "check",
          ariaHidden: true,
        },
      },
      {
        id: "online",
        label: "100% Online",
        icon: {
          name: "check",
          ariaHidden: true,
        },
      },
      {
        id: "certified-content",
        label: "Zertifizierte Inhalte",
        icon: {
          name: "check",
          ariaHidden: true,
        },
      },
    ],

    primaryCta: {
      label: "Jetzt starten",
      href: ROUTES.register,
      ariaLabel: "Jetzt mit Express-Führerschein starten",
    },

    secondaryCta: {
      label: "Mehr erfahren",
      href: `/#${HOME_SECTION_IDS.benefits}`,
      ariaLabel: "Mehr über Express-Führerschein erfahren",
    },

    desktopImage: {
      src: ASSETS.hero.desktop,
      alt: "Express-Führerschein – Premium-Fahrzeug vor Berliner Skyline",
      width: 2048,
      height: 768,
      priority: true,
    },

    mobileImage: {
      src: ASSETS.hero.mobile,
      alt: "Express-Führerschein – Fahrzeug und Berliner Skyline auf Mobilgeräten",
      width: 1024,
      height: 1536,
      priority: true,
    },
  },

  trust: {
    title: "Vertrauen durch geprüfte Qualität",

    partners: [
      {
        id: "trust-dekra",
        key: "dekra",
        name: "DEKRA",
        label: "Geprüfte Qualität",
        logo: {
          src: ASSETS.partners.dekra,
          alt: "DEKRA",
        },
      },
      {
        id: "trust-tuev",
        key: "tuev",
        name: "TÜV",
        label: "TÜV-zertifiziert",
        logo: {
          src: ASSETS.partners.tuev,
          alt: "TÜV",
        },
      },
      {
        id: "trust-kba",
        key: "kba",
        name: "KBA",
        label: "Anerkannt vom KBA",
        logo: {
          src: ASSETS.partners.kba,
          alt: "KBA",
        },
      },
      {
        id: "trust-trustpilot",
        key: "trustpilot",
        name: "Trustpilot",
        logo: {
          src: ASSETS.partners.trustpilot,
          alt: "Trustpilot",
        },
        rating: {
          value: "4,8/5",
          reviewCountLabel: "basierend auf 2.500+ Bewertungen",
        },
      },
    ],
  },

  stats: {
    items: [
      {
        id: "participants",
        value: "250.000+",
        label: "Erfolgreiche Teilnehmer",
        icon: {
          name: "graduation-cap",
          ariaHidden: true,
        },
      },
      {
        id: "duration",
        value: "21 Tage",
        label: "Durchschnittliche Dauer",
        icon: {
          name: "timer",
          ariaHidden: true,
        },
      },
      {
        id: "success-rate",
        value: "98%",
        label: "Bestehensquote",
        icon: {
          name: "shield-check",
          ariaHidden: true,
        },
      },
      {
        id: "support",
        value: "7 Tage / Woche",
        label: "Persönlicher Support",
        icon: {
          name: "headphones",
          ariaHidden: true,
        },
      },
    ],
  },

  licenseClasses: {
    id: HOME_SECTION_IDS.licenseClasses,
    eyebrow: "FÜHRERSCHEINKLASSEN",
    title: "Wähle deine Führerscheinklasse",
    subtitle: "Alle Kategorien – eine Plattform",
    items: HOME_LICENSE_CLASSES,
    viewAll: {
      label: "Alle Klassen anzeigen",
      href: ROUTES.licenseClasses,
    },
  },

  advantages: {
    id: HOME_SECTION_IDS.benefits,
    eyebrow: "DEINE VORTEILE",
    title: "Warum Express-Führerschein?",

    items: [
      {
        id: "online",
        title: "100% Online",
        description: "Lerne flexibel von überall.",
        icon: {
          name: "monitor",
          ariaHidden: true,
        },
      },
      {
        id: "exam-guarantee",
        title: "Prüfungsgarantie",
        description: "Wir bringen dich sicher durch.",
        icon: {
          name: "shield-check",
          ariaHidden: true,
        },
      },
      {
        id: "certified-content",
        title: "Zertifizierte Inhalte",
        description: "Aktuell, geprüft und rechtssicher.",
        icon: {
          name: "badge-check",
          ariaHidden: true,
        },
      },
      {
        id: "secure-payment",
        title: "Sichere Zahlung",
        description: "SSL-verschlüsselt & datenschutzkonform.",
        icon: {
          name: "lock",
          ariaHidden: true,
        },
      },
      {
        id: "support",
        title: "Persönlicher Support",
        description: "Wir sind jederzeit für dich da.",
        icon: {
          name: "headphones",
          ariaHidden: true,
        },
      },
    ],
  },

  program21: {
    id: HOME_SECTION_IDS.program21,
    eyebrow: "21-TAGE-PROGRAMM",
    title: "Dein Weg in 21 Tagen",
    subtitle:
      "Ein klar strukturierter Lernplan für deine Vorbereitung.",

    phases: [
      {
        id: "phase-1",
        days: "Tage 1–7",
        title: "Grundlagen lernen",
        description:
          "Grundlagen, Regeln, Verkehrszeichen und wichtige Kerninhalte.",
        step: 1,
      },
      {
        id: "phase-2",
        days: "Tage 8–14",
        title: "Intensiv trainieren",
        description:
          "Fragen, Übungen und gezielte Wiederholung deiner Fehler.",
        step: 2,
      },
      {
        id: "phase-3",
        days: "Tage 15–21",
        title: "Prüfungsbereit werden",
        description:
          "Prüfungssimulationen, gezielte Wiederholung und finale Vorbereitung.",
        step: 3,
      },
    ],

    cta: {
      label: "21-Tage-Programm starten",
      href: ROUTES.program21,
    },
  },

  howItWorks: {
    id: HOME_SECTION_IDS.process,
    eyebrow: "SO FUNKTIONIERT’S",
    title: "Einfach starten. Strukturiert lernen.",
    subtitle:
      "In vier klaren Schritten zu deiner Vorbereitung.",

    steps: [
      {
        id: "step-license-class",
        number: "01",
        title: "Führerscheinklasse wählen",
        description:
          "Wähle die passende Klasse für deinen Führerschein.",
        icon: {
          name: "car",
          ariaHidden: true,
        },
      },
      {
        id: "step-account",
        number: "02",
        title: "Konto erstellen",
        description:
          "Registriere dich in wenigen Schritten.",
        icon: {
          name: "user-plus",
          ariaHidden: true,
        },
      },
      {
        id: "step-learning",
        number: "03",
        title: "Lernen & trainieren",
        description:
          "Arbeite deinen Lernplan durch und trainiere gezielt.",
        icon: {
          name: "book-open",
          ariaHidden: true,
        },
      },
      {
        id: "step-exam",
        number: "04",
        title: "Prüfung vorbereiten",
        description:
          "Teste deinen Stand mit realistischen Prüfungssimulationen.",
        icon: {
          name: "clipboard-check",
          ariaHidden: true,
        },
      },
    ],
  },

  security: {
    id: HOME_SECTION_IDS.security,
    eyebrow: "SICHERHEIT",
    title: "Sicher. Transparent. Vertrauenswürdig.",
    subtitle:
      "Deine Daten und Zahlungen werden professionell geschützt.",

    items: [
      {
        id: "gdpr",
        title: "DSGVO-konform",
        description:
          "Datenschutz nach europäischen Standards.",
        icon: {
          name: "shield",
          ariaHidden: true,
        },
      },
      {
        id: "ssl",
        title: "SSL-Verschlüsselung",
        description:
          "Sichere Übertragung deiner Daten.",
        icon: {
          name: "lock",
          ariaHidden: true,
        },
      },
      {
        id: "payments",
        title: "Sichere Zahlungen",
        description:
          "Geschützte Zahlungsabwicklung.",
        icon: {
          name: "credit-card",
          ariaHidden: true,
        },
      },
      {
        id: "privacy",
        title: "Datenschutz",
        description:
          "Transparenter Umgang mit deinen Daten.",
        icon: {
          name: "fingerprint",
          ariaHidden: true,
        },
      },
    ],
  },

  reviews: {
    id: HOME_SECTION_IDS.reviews,
    eyebrow: "BEWERTUNGEN",
    title: "Was unsere Teilnehmer sagen",
    subtitle:
      "Erfahrungen von Teilnehmern mit Express-Führerschein.",

    /**
     * Real customer reviews will be supplied by backend/admin.
     * No fictional customer identities are stored in the frontend.
     */
    items: [],

    viewAll: {
      label: "Alle Bewertungen ansehen",
      href: ROUTES.reviews,
    },
  },

  countries: {
    id: HOME_SECTION_IDS.countries,
    eyebrow: "EUROPA",
    title: "Express-Führerschein in Europa",
    subtitle:
      "Eine Plattform – angepasst an das jeweilige Land.",
    items: HOME_COUNTRIES,
  },

  faq: {
    id: HOME_SECTION_IDS.faq,
    eyebrow: "FAQ",
    title: "Häufige Fragen",
    subtitle:
      "Die wichtigsten Antworten auf einen Blick.",

    items: [
      {
        id: "faq-program-21",
        question:
          "Wie funktioniert das 21-Tage-Programm?",
        answer:
          "Du erhältst einen klar strukturierten Lernplan mit täglichen Lern-, Trainings- und Wiederholungsaufgaben.",
      },
      {
        id: "faq-license-classes",
        question:
          "Welche Führerscheinklassen sind verfügbar?",
        answer:
          "Express-Führerschein ist für mehrere Führerscheinklassen aufgebaut. Die verfügbaren Klassen richten sich nach dem ausgewählten Land.",
      },
      {
        id: "faq-mobile",
        question:
          "Kann ich auf dem Smartphone lernen?",
        answer:
          "Ja. Die Plattform ist für Smartphone, Tablet und Computer optimiert.",
      },
      {
        id: "faq-languages",
        question:
          "Welche Sprachen werden unterstützt?",
        answer:
          "Die Plattform ist für Deutsch, Französisch, Niederländisch, Spanisch, Italienisch und Englisch vorbereitet.",
      },
      {
        id: "faq-exams",
        question:
          "Wie funktionieren die Prüfungssimulationen?",
        answer:
          "Du kannst deinen Wissensstand mit Prüfungssimulationen testen und anschließend deine Fehler gezielt wiederholen.",
      },
      {
        id: "faq-support",
        question:
          "Wie erhalte ich Unterstützung?",
        answer:
          "Der persönliche Support begleitet dich während deiner Vorbereitung und hilft dir bei Fragen zur Plattform.",
      },
    ],

    viewAll: {
      label: "Alle Fragen ansehen",
      href: ROUTES.faq,
    },
  },

  finalCta: {
    id: HOME_SECTION_IDS.finalCta,
    title: "Bereit für deinen Führerschein?",
    subtitle:
      "Starte jetzt deine Vorbereitung mit Express-Führerschein.",

    cta: {
      label: "Jetzt starten",
      href: ROUTES.register,
      ariaLabel: "Jetzt registrieren und Vorbereitung starten",
    },

    note: "In wenigen Minuten registriert.",
  },

  footer: HOME_FOOTER_DATA,
} as const satisfies HomePageData;

export type ExpressHomeData = typeof HOME_DATA;
