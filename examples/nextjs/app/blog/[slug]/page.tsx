import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { getPostBySlug } from "@/lib/getPostBySlug";
import { blog } from "@/lib/notionpress";

type BlogPostPageProps = {
    params: { slug: string };
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <article>
            <h1>{post.title}</h1>

            {post.published_date && (
                <time dateTime={post.published_date}>{post.published_date}</time>
            )}

            {post.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover_image} alt={post.title} />
            )}

            <Markdown>{post.content}</Markdown>
        </article>
    );
}

// Pre-render every known slug at build time.
export async function generateStaticParams() {
    const posts = await blog.getPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);

    return {
        title: post?.title ?? "Post not found",
    };
}
