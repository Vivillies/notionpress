# SvelteKit example

```bash
npm install notionpress marked
```

Drop `src/lib/` and `src/routes/blog/[slug]/` into a SvelteKit project.

Set `NOTION_API` and `NOTION_PAGE_ID` in `.env`, then visit `/blog/<slug>`. These are read via `$env/static/private`, so they're only ever available server-side.
