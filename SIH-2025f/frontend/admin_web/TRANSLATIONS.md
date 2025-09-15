# Translations Guide

This project uses i18next with react-i18next.

## Add or edit strings
- Edit files under `src/locales/<lang>/translation.json`.
- Keep keys consistent across languages.
- Use nested keys like `common.logout` or `login.email`.

## Use in components
```jsx
import { useTranslation } from 'react-i18next';

const Comp = () => {
  const { t } = useTranslation();
  return <span>{t('common.logout')}</span>;
};
```

## Add a new language
1. Create `src/locales/<code>/translation.json`.
2. Import and register in `src/i18n.js` resources and `supportedLngs`.
3. Add to the `languages` array in `src/components/ui/LanguageSwitcher.jsx`.

## Language persistence and detection
- Selection is saved in `localStorage`.
- Browser language is used as a fallback.

## RTL support
- Urdu (`ur`) sets `dir=rtl` on `<html>` automatically via the switcher.

## Fonts
- Noto Sans families for Devanagari, Bengali, Ol Chiki, Arabic are loaded in `index.html`.
- Global `font-family` is set in `src/index.css`.

## Tips
- Avoid hard-coded UI strings; place them in locale files and call `t(...)`.
- For dynamic values: `t('greet', { name: userName })` with `"greet": "Hello {{name}}"`.