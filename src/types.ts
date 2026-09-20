export interface RootClientProps {
    api_key: string;
    page_id: string;
    datasource_id?: string;
}

export type PostStatus = "Published" | "Editing" | "Deprived";

export interface Post {
    id: string;
    url: string;
    title: string;
    slug: string;
    status: PostStatus | null;
    published_date: string | null;
    cover_image: string | null;
}