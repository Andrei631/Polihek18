import { File, Paths } from 'expo-file-system';
import * as Localization from 'expo-localization';

export type SupportedLanguage = 'en' | 'ro' | 'de' | 'es' | 'fr' | 'it' | 'pt';

const LANGUAGE_FILE_NAME = 'app_language.json';
const getLanguageFile = () => new File(Paths.document, LANGUAGE_FILE_NAME);

export function normalizeLanguage(tagOrLanguage?: string | null): SupportedLanguage {
  const lower = (tagOrLanguage ?? '').toLowerCase();
  if (lower.startsWith('ro')) return 'ro';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('fr')) return 'fr';
  if (lower.startsWith('it')) return 'it';
  if (lower.startsWith('pt')) return 'pt';
  return 'en';
}

export function getDeviceLanguage(): SupportedLanguage {
  const locales = Localization.getLocales?.() ?? [];
  const first = locales[0];
  return normalizeLanguage(first?.languageTag ?? first?.languageCode ?? 'en');
}

export async function loadStoredLanguage(): Promise<SupportedLanguage | null> {
  try {
    const file = getLanguageFile();
    // expo-file-system File API exposes `exists` as a property
    if (!file.exists) return null;
    const content = await file.text();
    const parsed = JSON.parse(content);
    const language = typeof parsed?.language === 'string' ? parsed.language : null;
    return language ? normalizeLanguage(language) : null;
  } catch {
    return null;
  }
}

export async function persistLanguage(language: SupportedLanguage): Promise<void> {
  const file = getLanguageFile();
  await file.create({ intermediates: true, overwrite: true });
  await file.write(JSON.stringify({ language }));
}
