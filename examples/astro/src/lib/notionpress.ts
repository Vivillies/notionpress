import { Notionpress } from "notionpress";

const NOTION_API = import.meta.env.NOTION_API;
const NOTION_PAGE_ID = import.meta.env.NOTION_PAGE_ID;

if (!NOTION_API || !NOTION_PAGE_ID) {
    throw new Error("Missing NOTION_API or NOTION_PAGE_ID environment variables");
}

// Shared across requests — the client caches its Notion database/data source
// IDs internally, so it only needs to be constructed once per server process.
export const blog = new Notionpress({
    api_key: NOTION_API,
    page_id: NOTION_PAGE_ID,
});
