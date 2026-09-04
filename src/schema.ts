import z from "zod";

const notionColor = z.enum([
    "default",
    "gray",
    "brown",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "red",
]);

const selectOption = z.object({
    name: z.string(),
    color: notionColor,
});

export const defaultDatasource = z.object({
    properties: z.object({
        Name: z.object({
            id: z.string(),
            name: z.string(),
            type: z.string().default("title")
        }),
        cover_image: z.object({
            id: z.string(),
            name: z.string(),
            type: z.string().default("files")
        }),
        published_date: z.object({
            id: z.string(),
            name: z.string(),
            type: z.string().default("date")
        }),
        slug: z.object({
            id: z.string(),
            name: z.string(),
            type: z.string().default("rich_text")
        }),
        title: z.object({
            id: z.string(),
            name: z.string(),
            type: z.string().default("rich_text")
        }),
        status: z.object({
            id: z.string(),
            name: z.string(),
            type: z.string().default("select"),
            select: z.object({
                options: z.array(selectOption).default([
                    { name: "Published", color: "green" },
                    { name: "Editing", color: "blue" },
                    { name: "Deprived", color: "red" },
                ])
            })
        })

    })
})

export type DefaultDatasource = z.infer<typeof defaultDatasource>;