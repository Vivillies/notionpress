import { Notionpress } from "notionpress";
import { NOTION_API, NOTION_PAGE_ID } from "$env/static/private";

// Shared across requests — the client caches its Notion database/data source
// IDs internally, so it only needs to be constructed once per server process.
export const blog = new Notionpress({
    api_key: NOTION_API,
    page_id: NOTION_PAGE_ID,
});
