import { useTranslation } from '@/shared/hooks/use-translation';
import { LanguageSwitcher } from '@/shared/components/language-switcher';

export const TranslationExamples = () => {
  const { t, formatNumber, formatDate, hasTranslation, isPlural } = useTranslation();

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Translation Examples</h1>
        <LanguageSwitcher />
      </div>

      <div className="space-y-8">
        {/* Simple translations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Simple Translations</h2>
          <div className="space-y-2">
            <p><strong>Welcome:</strong> {t('welcome')}</p>
            <p><strong>Hello:</strong> {t('hello')}</p>
            <p><strong>Language:</strong> {t('language')}</p>
            <p><strong>Loading:</strong> {t('loading')}</p>
          </div>
        </section>

        {/* Nested keys */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Nested Keys</h2>
          <div className="space-y-2">
            <p><strong>Main Page Title:</strong> {t('main-page.title')}</p>
            <p><strong>Main Page Subtitle:</strong> {t('main-page.subtitle')}</p>
            <p><strong>Main Page Description:</strong> {t('main-page.description')}</p>
          </div>
        </section>

        {/* Pluralization */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Pluralization</h2>
          <div className="space-y-2">
            <p><strong>0 apples:</strong> {t('apple', { count: 0 })}</p>
            <p><strong>1 apple:</strong> {t('apple', { count: 1 })}</p>
            <p><strong>5 apples:</strong> {t('apple', { count: 5 })}</p>
            <p><strong>100 apples:</strong> {t('apple', { count: 100 })}</p>
          </div>
        </section>

        {/* Interpolation */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Interpolation</h2>
          <div className="space-y-2">
            <p><strong>More items:</strong> {t('more-items', { count: 10 })}</p>
            <p><strong>Allowed symbols:</strong> {t('allowed-symbols', { symbols: '/.>%^' })}</p>
            <p><strong>User greeting:</strong> {t('user-greeting', { name: 'John' })}</p>
            <p><strong>Items count:</strong> {t('items-count', { count: 42 })}</p>
            <p><strong>Form validation:</strong> {t('forms.validation.minLength', { min: 8 })}</p>
          </div>
        </section>

        {/* Advanced formatting */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Advanced Formatting</h2>
          <div className="space-y-2">
            <p><strong>Formatted number:</strong> {formatNumber(1234.56)}</p>
            <p><strong>Currency:</strong> {formatNumber(99.99, { style: 'currency', currency: 'USD' })}</p>
            <p><strong>Percentage:</strong> {formatNumber(0.75, { style: 'percent' })}</p>
            <p><strong>Formatted date:</strong> {formatDate(new Date(), { dateStyle: 'full' })}</p>
          </div>
        </section>

        {/* Utility functions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Utility Functions</h2>
          <div className="space-y-2">
            <p><strong>Has 'welcome' translation:</strong> {hasTranslation('welcome') ? 'Yes' : 'No'}</p>
            <p><strong>Has 'nonexistent' translation:</strong> {hasTranslation('nonexistent') ? 'Yes' : 'No'}</p>
            <p><strong>Is 'apple' plural:</strong> {isPlural('apple') ? 'Yes' : 'No'}</p>
            <p><strong>Is 'welcome' plural:</strong> {isPlural('welcome') ? 'Yes' : 'No'}</p>
          </div>
        </section>

        {/* Combined examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Combined Examples</h2>
          <div className="space-y-2">
            <p><strong>Dynamic counts:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              {[0, 1, 2, 5, 10].map(count => (
                <li key={count}>
                  {count}: {t('apple', { count })}
                </li>
              ))}
            </ul>
            <p><strong>Different items:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              {[0, 1, 5].map(count => (
                <li key={count}>
                  {count}: {t('item', { count })}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};