import 'react-i18next';
import type { TranslationResource } from './types';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: TranslationResource;
  }
}
