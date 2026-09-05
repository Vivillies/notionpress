import { Notionpress } from "../src";
import { env } from "node:process";


const test = new Notionpress({ 
    api_key: env.NOTION_API as string,
    page_id: "3d26c8c9-77c9-8021-bb21-c6c01b27566e"
})