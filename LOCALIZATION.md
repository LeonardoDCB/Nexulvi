# Localization

The site publishes Brazilian Portuguese at the existing root URLs and localized static pages under `/<locale>/` for the other 15 locales. The language picker preserves the current page when switching languages. Page translations, metadata, accessibility labels, app copy, and privacy-policy text are generated into `localized/`; visitors do not call an external translation service.

Supported locales: `pt-BR`, `en-US`, `es-ES`, `en-GB`, `es-419`, `de-DE`, `fr-FR`, `it-IT`, `pt-PT`, `nl-NL`, `ja-JP`, `ko-KR`, `hi-IN`, `id`, `tr-TR`, and `pl-PL`.

When Portuguese source copy changes, regenerate the static pages with `npm run localize` (requires network access to Google's translation endpoint), review the resulting legal and product text with fluent speakers, then run `npm run build`. The generated translations are stored in the repository so CI and visitors do not need translation-service access. In particular, privacy, advertising, permissions, and data-retention statements need human review before being treated as legally authoritative.
