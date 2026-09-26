# Next.js (App Router) example

```bash
npm install notionpress react-markdown
```

Drop `lib/` and `app/blog/[slug]/page.tsx` into a Next.js App Router project (adjust the `@/lib/...` import paths if your `tsconfig.json` doesn't already alias `@/*` to the project root — `create-next-app` does this by default).

Set `NOTION_API` and `NOTION_PAGE_ID` in `.env.local`, then visit `/blog/<slug>`.
