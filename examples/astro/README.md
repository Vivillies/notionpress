# Astro example

```bash
npm install notionpress marked
```

Drop `src/lib/` and `src/pages/blog/[slug].astro` into an Astro project (any rendering mode — static or server — works, since the fetch happens in the frontmatter).

Set `NOTION_API` and `NOTION_PAGE_ID` in `.env`, then visit `/blog/<slug>`.
