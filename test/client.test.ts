import { Notionpress } from "../src";
import { env } from "node:process"

const test = new Notionpress({ 
    api_key: env.NOTION_API as string,
    page_id: env.NOTION_PAGE_ID as string,
})


const posts = await test.getPosts()
console.log(posts)

if (posts.length > 0 && posts[0] !== undefined) {
    const body = await test.getPostContent(posts[0].id)
    
    console.log(body)
}