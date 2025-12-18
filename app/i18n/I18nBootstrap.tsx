import React from 'react';
import i18n from './i18n';
import { loadStoredLanguage } from './language';

export function I18nBootstrap({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await loadStoredLanguage();
      if (cancelled) return;
      if (stored && stored !== i18n.language) {
        await i18n.changeLanguage(stored);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
