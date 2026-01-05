import { useTranslation } from '@/shared/hooks/use-translation';
import type { LanguageConfig, SupportedLanguage } from '@/i18n/types';

const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'es', name: 'Español', flag: 'ES' },
];

export const LanguageSwitcher = () => {
  const { t, language, changeLanguage } = useTranslation();

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    changeLanguage(languageCode);
  };

  return (
    <div className="relative inline-block">
      <label htmlFor="language-select" className="sr-only">
        {t('language')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLanguageChange(e.target.value as SupportedLanguage)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
