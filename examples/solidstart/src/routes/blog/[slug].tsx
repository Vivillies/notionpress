import { createAsync, query, useParams } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { Show } from "solid-js";
import { marked } from "marked";
import { getPostBySlug } from "~/lib/getPostBySlug";

const findPostBySlug = query(async (slug: string) => {
    "use server";
    return getPostBySlug(slug);
}, "post-by-slug");

export default function BlogPostPage() {
    const params = useParams<{ slug: string }>();
    const post = createAsync(() => findPostBySlug(params.slug));

    return (
        <Show when={post()} fallback={<p>Post not found</p>}>
            {(post) => (
                <article>
                    <Title>{post().title}</Title>

                    <h1>{post().title}</h1>

                    <Show when={post().published_date}>
                        {(date) => <time datetime={date()}>{date()}</time>}
                    </Show>

                    <Show when={post().cover_image}>
                        {(src) => <img src={src()} alt={post().title} />}
                    </Show>

                    <div innerHTML={marked(post().content) as string} />
                </article>
            )}
        </Show>
    );
}
