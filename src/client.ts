import { Client as NotionClient, type PageObjectResponse } from "@notionhq/client";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { defaultDatasource } from "./schema";
import type { Post, PostStatus, RootClientProps } from "./types";

const CACHE_FILE = ".notionpress-cache.json";

type CacheEntry = {
    database_id?: string;
    datasource_id: string;
};

/**
 * Reads the on-disk cache file mapping page IDs to their database/data source IDs.
 * Returns an empty object if the file doesn't exist or fails to parse.
 */
function readCache(): Record<string, CacheEntry> {
    if (!existsSync(CACHE_FILE)) {
        return {};
    }

    try {
        return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
    } catch {
        return {};
    }
}

/**
 * Persists (or overwrites) the cache entry for a given page ID.
 */
function writeCacheEntry(page_id: string, entry: CacheEntry) {
    const cache = readCache();
    cache[page_id] = entry;
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export class Notionpress {
    private api_key: string;
    private page_id: string;
    private database_id: undefined | string;
    private notionClient: NotionClient;
    private dataSourceId: undefined | string;
    private ready: Promise<void>;

    /**
     * Creates a Notionpress client bound to a single Notion page.
     * Kicks off async setup (finding or creating the underlying database/data source)
     * in the background; awaited internally by any public method via `this.ready`.
     */
    constructor(params: RootClientProps) {
        this.api_key = params.api_key;
        this.page_id = params.page_id;
        this.notionClient = new NotionClient({ auth: this.api_key });

        
        this.ready = this.initiateTable().catch((error) => {
            console.error("Notionpress failed to initialize:", error)
            throw error
        })
    }

    /**
     * Runs the async initialization steps required before the client is usable.
     */
    private async initiateTable() {
        await this.createDataSources()
    }

    /**
     * Resolves `this.database_id` / `this.dataSourceId` for `this.page_id`, in priority order:
     * 1. Use the caller-supplied `datasource_id` as-is.
     * 2. Reuse a previously cached database/data source for this page.
     * 3. Otherwise, create a new database on the page with the default schema.
     * Any newly resolved IDs are written back to the cache file.
     */
    private async createDataSources() {
        // Caller already told us exactly which data source to use.
        if (this.dataSourceId) {
            writeCacheEntry(this.page_id, { database_id: this.database_id, datasource_id: this.dataSourceId })
            return
        }

        // We've already set this exact page up before; reuse it instead of
        // creating a new database on it every time.
        const cached = readCache()[this.page_id]

        if (cached) {
            this.database_id = cached.database_id
            this.dataSourceId = cached.datasource_id
            return
        }

        // Brand new page: create a database on it with our schema baked in.
        const database = await this.notionClient.databases.create({
            parent: {
                page_id: this.page_id,
                type: "page_id",
            },
            title: [{ text: { content: "blog_database" } }],
            initial_data_source: {
                // @ts-expect-error - Old and New SDK and API calls collide, will fix later
                properties: { ...defaultDatasource }
            }
        })

        this.database_id = database.id

        if ("data_sources" in database) {
            this.dataSourceId = database.data_sources[0]?.id
        }

        if (this.dataSourceId) {
            writeCacheEntry(this.page_id, { database_id: this.database_id, datasource_id: this.dataSourceId })
        }
    }

    /**
     * Maps a raw Notion page object (from the blog database) to our `Post` shape,
     * pulling out title, slug, status, published date, and cover image.
     */
    private toPost(page: PageObjectResponse): Post {
        const properties = page.properties

        const title = properties.title
        const slug = properties.slug
        const status = properties.status
        const published_date = properties.published_date
        const cover_image = properties.cover_image

        const titleText = title?.type === "title"
            ? title.title.map((item) => item.plain_text).join("")
            : ""

        const slugText = slug?.type === "rich_text"
            ? slug.rich_text.map((item) => item.plain_text).join("")
            : ""

        const statusName = status?.type === "select"
            ? (status.select?.name as PostStatus | undefined) ?? null
            : null

        const publishedDateValue = published_date?.type === "date"
            ? published_date.date?.start ?? null
            : null

        const coverImageFile = cover_image?.type === "files" ? cover_image.files[0] : undefined
        const coverImageUrl = coverImageFile
            ? (coverImageFile.type === "file" ? coverImageFile.file.url : coverImageFile.external.url)
            : null

        return {
            id: page.id,
            url: page.url,
            title: titleText,
            slug: slugText,
            status: statusName,
            published_date: publishedDateValue,
            cover_image: coverImageUrl
        }
    }

    /**
     * Fetches all posts from the configured data source, paging through
     * results until every entry has been collected.
     *
     * @throws if no `dataSourceId` is available (must be set manually after
     * a table/database is created).
     */
    public async getPosts(): Promise<Post[]> {
        await this.ready

        if (!this.dataSourceId) {
            throw new Error("Once a table/database is created you have to manually add the datasource_id to the variable initiator")
        }

        const posts: Post[] = []
        let cursor: string | undefined = undefined

        do {
            const response = await this.notionClient.dataSources.query({
                data_source_id: this.dataSourceId,
                start_cursor: cursor
            })

            for (const result of response.results) {
                if (result.object === "page" && "properties" in result) {
                    posts.push(this.toPost(result))
                }
            }

            cursor = response.next_cursor ?? undefined
        } while (cursor)

        return posts
    }

    public async getPostContent(page_id: string): Promise<string> {
        await this.ready

        const { markdown } = await this.notionClient.pages.retrieveMarkdown({ page_id })

        return markdown
    }

    
}