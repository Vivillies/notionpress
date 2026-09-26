import type { Post } from "notionpress";
import { blog } from "./notionpress";

export type PostWithContent = Post & { content: string };

/**
 * Finds a post by slug and returns it together with its markdown body,
 * or `null` if no post has that slug.
 */
export async function getPostBySlug(slug: string): Promise<PostWithContent | null> {
    const posts = await blog.getPosts();
    const post = posts.find((candidate) => candidate.slug === slug);

    if (!post) {
        return null;
    }

    const content = await blog.getPostContent(post.id);

    return { ...post, content };
}
