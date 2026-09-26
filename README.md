# notionpress

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Runtime: Bun](https://img.shields.io/badge/runtime-bun-000000?logo=bun)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6?logo=typescript&logoColor=white)

**Turn a Notion page into a headless CMS for your blog.**

`notionpress` is a lightweight TypeScript client that provisions a blog database on any Notion page (with a ready-made schema for title, slug, status, publish date, and cover image), and gives you a typed API to fetch posts and their content as markdown — no manual database setup required.

## Features

- 🗄️ **Zero-config provisioning** — point it at a Notion page and it creates a database with the right schema automatically.
- 📝 **Typed posts** — `getPosts()` returns clean, typed `Post` objects instead of raw Notion API responses.
- 📄 **Markdown content** — `getPostContent(id)` returns a post's body as ready-to-render markdown.
- 💾 **Local caching** — database/data source IDs are cached on disk so you're not re-creating a database on every run.
- 🔌 **Bring your own database** — already have a Notion database? Pass its `datasource_id` and skip auto-provisioning entirely.

## Installation

```bash
bun add notionpress
# or
npm install notionpress
# or
pnpm add notionpress
```

## Prerequisites

1. **Create a Notion integration** at [notion.so/my-integrations](https://www.notion.so/my-integrations) and copy its **Internal Integration Secret** — this is your `api_key`.
2. **Share a Notion page** with that integration (`•••` menu → *Connections* → select your integration). This page is where your blog database will live — copy its **page ID** from the URL.

## Quick Start

```ts
import { Notionpress } from "notionpress";

const blog = new Notionpress({
  api_key: process.env.NOTION_API!,
  page_id: process.env.NOTION_PAGE_ID!,
});

// Fetch all posts
const posts = await blog.getPosts();
console.log(posts);

// Fetch the markdown body of a specific post
if (posts[0]) {
  const markdown = await blog.getPostContent(posts[0].id);
  console.log(markdown);
}
```

On first run, `notionpress` creates a new database titled **"blog_database"** on the given page and caches its IDs in `.notionpress-cache.json` (add this to your `.gitignore`) so subsequent runs reuse the same database instead of creating a new one.

## Environment variables

Create a `.env` file (see `.env.example`):

```bash
NOTION_API=secret_xxx        # your integration's internal secret
NOTION_PAGE_ID=xxxxxxxxxxxx  # the page to host/host your blog database
```

## API Reference

### `new Notionpress(params)`

| Param           | Type     | Required | Description                                                                 |
| --------------- | -------- | -------- | ----------------------------------------------------------------------------|
| `api_key`       | `string` | ✅       | Your Notion integration secret.                                             |
| `page_id`       | `string` | ✅       | ID of the Notion page to provision (or that already hosts) the blog database. |

### `getPosts(): Promise<Post[]>`

Returns every post in the blog database, fully paginated.

```ts
type Post = {
  id: string;
  url: string;
  title: string;
  slug: string;
  status: "Published" | "Editing" | "Deprived" | null;
  published_date: string | null;
  cover_image: string | null;
};
```

### `getPostContent(page_id: string): Promise<string>`

Returns the markdown body of a single post page.

## Fetching a post by slug

`notionpress` doesn't expose a dedicated "get by slug" method — instead, pull the full list from `getPosts()`, find the matching slug, then fetch its body with `getPostContent()`. A tiny shared helper keeps this logic in one place:

```ts
// lib/getPostBySlug.ts
import { blog } from "./notionpress"; // your Notionpress instance

export async function getPostBySlug(slug: string) {
  const posts = await blog.getPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return null;

  const content = await blog.getPostContent(post.id);
  return { ...post, content };
}
```

### Next.js (App Router)

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { getPostBySlug } from "@/lib/getPostBySlug";
import { blog } from "@/lib/notionpress";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <Markdown>{post.content}</Markdown>
    </article>
  );
}

// Optional: pre-render every known slug at build time
export async function generateStaticParams() {
  const posts = await blog.getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

### SvelteKit

```ts
// src/routes/blog/[slug]/+page.server.ts
import { error } from "@sveltejs/kit";
import { getPostBySlug } from "$lib/getPostBySlug";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPostBySlug(params.slug);

  if (!post) throw error(404, "Post not found");

  return { post };
};
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import { marked } from "marked";
  export let data;
</script>

<article>
  <h1>{data.post.title}</h1>
  {@html marked(data.post.content)}
</article>
```

### SolidStart

```tsx
// src/routes/blog/[slug].tsx
import { createAsync, query } from "@solidjs/router";
import { marked } from "marked";
import { getPostBySlug } from "~/lib/getPostBySlug";

const findPost = query(async (slug: string) => {
  "use server";
  return getPostBySlug(slug);
}, "post-by-slug");

export default function BlogPostPage(props: { params: { slug: string } }) {
  const post = createAsync(() => findPost(props.params.slug));

  return (
    <article>
      <h1>{post()?.title}</h1>
      <div innerHTML={marked(post()?.content ?? "")} />
    </article>
  );
}
```

### Astro

```astro
---
// src/pages/blog/[slug].astro
import { getPostBySlug } from "../../lib/getPostBySlug";
import { marked } from "marked";

const { slug } = Astro.params;
const post = await getPostBySlug(slug!);

if (!post) return Astro.redirect("/404");

const html = marked(post.content);
---

<article>
  <h1>{post.title}</h1>
  <Fragment set:html={html} />
</article>
```

> `getPostContent()` returns raw markdown, so pick whichever markdown-to-HTML renderer fits your stack (`react-markdown`, `marked`, `markdown-it`, etc.) to turn it into rendered output.

Full, typed-out, copy-pasteable versions of each of these live in [`examples/`](./examples).

## Default schema

When `notionpress` provisions a database for you, it creates the following properties:

| Property         | Notion type   |
| ----------------- | ------------- |
| `Title`           | Title         |
| `Slug`            | Rich text     |
| `Status`          | Select (`Published`, `Editing`, `Deprived`) |
| `Published Date`  | Date          |
| `Cover Image`     | Files         |

## Development

```bash
bun install     # install dependencies
bun run test    # run tests
bun run build   # compile to dist/
```

## Contributing

Issues and pull requests are welcome! If you're proposing a larger change, please open an issue first to discuss what you'd like to change.

## License

[MIT](./LICENSE)
