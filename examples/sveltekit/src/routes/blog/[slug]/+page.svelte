<script lang="ts">
    import { marked } from "marked";
    import type { PageData } from "./$types";

    export let data: PageData;

    $: html = marked(data.post.content);
</script>

<svelte:head>
    <title>{data.post.title}</title>
</svelte:head>

<article>
    <h1>{data.post.title}</h1>

    {#if data.post.published_date}
        <time datetime={data.post.published_date}>{data.post.published_date}</time>
    {/if}

    {#if data.post.cover_image}
        <img src={data.post.cover_image} alt={data.post.title} />
    {/if}

    {@html html}
</article>
