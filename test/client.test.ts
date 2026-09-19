import { Notionpress } from "../src";
import { env } from "node:process"

const test = new Notionpress({ 
    api_key: env.NOTION_API as string,
    page_id: "3e06c8c9-77c9-801f-b0f5-ca92d5b231fc"
})