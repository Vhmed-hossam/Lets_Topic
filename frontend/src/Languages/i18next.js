import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    lng: "en",
    fallbackLng: "en",
    whilelisting: ["en", "fr", "de", "ar", "hi"],
    detection: {
      caches: ['cookie'],
      lookupFromPathIndex: 0,
    },
    resources: {
      en: {
        greeting: "Hello, Welcome!",
      },
      fr: {
        greeting: "Bonjour, Bienvenue!",
      },
      de: {
        greeting: "Hallo, Willkommen!",
      },
      ar: {
        greeting: "مرحبا، مرحبا!",
      },
      hi: {
        greeting: "नमस्ते, स्वागत है!",
      },
      pt: {
        greeting: "Olá, Bem-vindo!",
      }
    },
  });
