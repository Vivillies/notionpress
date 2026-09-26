# Examples

Full, typed-out examples of rendering a single blog post by its `slug` with `notionpress`, one per framework. Each folder mirrors that framework's conventional project layout so files can be dropped straight into a scaffolded app.

| Framework | Folder |
| --- | --- |
| Next.js (App Router) | [`nextjs/`](./nextjs) |
| SvelteKit | [`sveltekit/`](./sveltekit) |
| SolidStart | [`solidstart/`](./solidstart) |
| Astro | [`astro/`](./astro) |

Every example shares the same two building blocks:

- **`lib/notionpress.ts`** — instantiates a single shared `Notionpress` client from environment variables.
- **`lib/getPostBySlug.ts`** — looks a post up by `slug` via `getPosts()`, then fetches its markdown body with `getPostContent()`.

...and then a framework-specific route under `blog/[slug]` that renders it.

All examples expect the following environment variables (see the root [`.env.example`](../.env.example)):

```bash
NOTION_API=secret_xxx
NOTION_PAGE_ID=xxxxxxxxxxxx
```

And a markdown renderer of your choice installed alongside `notionpress` (`marked` and `react-markdown` are used below, but any markdown-to-HTML library works).
