export const defaultDatasource = {
    cover_image: {
        name: "Cover Image",
        type: "files",
        files: {}
    },
    published_date: {
        name: "Published Date",
        type: "date",
        date: {}
    },
    slug: {
        name: "Slug",
        type: "rich_text",
        rich_text: {}
    },
    title: {
        name: "Title",
        type: "title",
        title: {}
    },
    status: {
        name: "Status",
        type: "select",
        select: {
            options: [
                { name: "Published", color: "green" },
                { name: "Editing", color: "blue" },
                { name: "Deprived", color: "red" },
            ]
        }
    }
}