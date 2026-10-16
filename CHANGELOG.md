# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.2] - 2026-10-17

### Fixed

- **`BrowserTokenNotAllowedError` thrown on Cloudflare Workers (and similar edge runtimes).** `@notionhq/client` added a browser-detection guard that can false-positive on worker-style global scopes. `notionpress` is a server-only library by design — its API key is never meant to reach a browser bundle — so the inner client is now constructed with `dangerouslyAllowBrowser: true` instead of making every consumer discover and work around this per runtime.

### Changed

- Bumped the `@notionhq/client` dependency floor to `^5.27.0`, the version that introduced the `dangerouslyAllowBrowser` option.

## [0.1.1] - 2026-10-16

### Fixed

- **`datasource_id` passed to the constructor was silently ignored.** `RootClientProps` accepted it, but the constructor never assigned it, so the client always fell through to its cache-or-create logic regardless of what was passed in — the documented "bring your own database" escape hatch didn't actually work.
- **Repeated database creation on serverless/edge runtimes** (e.g. Cloudflare Workers). The on-disk cache (`.notionpress-cache.json`) relies on a persistent filesystem that these runtimes don't provide, so every cold invocation missed the cache and provisioned a brand-new Notion database. Combined with the `datasource_id` bug above, there was no way to avoid this. Cache reads/writes are now best-effort (wrapped so a missing/unwritable filesystem degrades to "no caching" instead of throwing), and once a `datasource_id` is supplied the client skips the cache entirely — nothing to persist.

### Added

- `description`, `license`, `author`, `repository`, `bugs`, `homepage`, and `keywords` fields to `package.json` for npm publishing.

### Migration note

If you're running on a serverless/edge platform (Cloudflare Workers, Vercel Edge, etc.), provision the database once from a normal Node/Bun environment, then pass the resulting `datasource_id` explicitly:

```ts
const blog = new Notionpress({
  api_key: process.env.NOTION_API!,
  page_id: process.env.NOTION_PAGE_ID!,
  datasource_id: process.env.NOTION_DATASOURCE_ID!,
});
```

This was always the intended pattern for those environments — it just didn't work until this release.
