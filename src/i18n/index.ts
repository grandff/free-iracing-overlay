import { settings, updateSettings, SupportedLanguage } from "../stores/settingsStore.ts";
import { translations, Translations, SUPPORTED_LANGUAGES, LanguageOption } from "./locales.ts";

export function t(): Translations {
  const lang = settings.language || "ko";
  return translations[lang] || translations.ko;
}

export function setLanguage(lang: SupportedLanguage) {
  updateSettings("language", lang);
}

export { SUPPORTED_LANGUAGES };
export type { SupportedLanguage, LanguageOption, Translations };
