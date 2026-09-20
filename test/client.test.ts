import { Notionpress } from "../src";
import { env } from "node:process"

const test = new Notionpress({ 
    api_key: env.NOTION_API as string,
    page_id: "<PAGE-ID>",
})