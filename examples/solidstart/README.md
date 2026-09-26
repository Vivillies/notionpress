# SolidStart example

```bash
npm install notionpress marked
```

Drop `src/lib/` and `src/routes/blog/[slug].tsx` into a SolidStart project.

Set `NOTION_API` and `NOTION_PAGE_ID` in `.env`, then visit `/blog/<slug>`. The lookup runs inside a server `query`, so the Notion API key never reaches the client bundle.
