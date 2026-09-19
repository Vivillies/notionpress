import { Client as NotionClient } from "@notionhq/client";
import { defaultDatasource } from "./schema";

export class Notionpress {
    private api_key: string;
    private page_id: string;
    private notionClient: NotionClient;
    private databaseId: string;

    constructor(params: { api_key: string, page_id: string }) {
        this.api_key = params.api_key;
        this.page_id = params.page_id;
        this.notionClient = new NotionClient({ auth: this.api_key });
        this.databaseId = ""


        this.initiateTable().catch((error) => {
            console.error("Notionpress failed to initialize:", error)
        })
    }

    private async initiateTable() {
        await this.createDataSources()
    }

    private async createDataSources(){
        const database_name = "blog_database"
        /**
         * In order to create a data-source we need a database
         * 
         * 1. Create a database and bind it to the page_id
         * 2. Create a data-source and bind it to the database
         */


        // 1. Check if the database exists
        const databaseQuery = await this.notionClient.search({
            query: database_name,
            filter: {
                property: "object",
                value: "data_source"
            }
        })

        if (databaseQuery.results.length == 0){
            const database = await this.notionClient.databases.create({
                parent: { page_id: this.page_id, type: "page_id"},
                title: [{ text: { content: database_name } }],
            })

            this.databaseId = database.id

            const data_source = await this.notionClient.dataSources.create({
                parent: { database_id: database.id },
                title: [{ text: { content: database_name } }],
                // @ts-expect-error - Old and New SDK and API calls collide, will fix later
                properties: { ...defaultDatasource }
            })

            // Once we create a new database, update the view to make it more user friendly
            // From Table -> Gallery (Feed is not supported as of this current git commit date)

            const feedView = await this.notionClient.views.create({
                database_id: database.id,
                data_source_id: data_source.id,
                name: "Write blogs here!",
                type: "gallery",
                configuration: {
                    type: "gallery",
                    card_layout: "list",
                    cover_size: "large"
                }
            })

            // Notion always creates a default table view when a database is created.
            // Now that we have a dedicated view, the default one is redundant.
            await this.deleteDefaultView(data_source.id, feedView.id)
        }


    }

    private async deleteDefaultView(data_source_id: string, keepViewId: string){
        const { results } = await this.notionClient.views.list({
            data_source_id
        })

        console.log(results)

        const defaultViews = results.filter((view) => view.id !== keepViewId)

        for (const view of defaultViews) {
            await this.notionClient.views.delete({ view_id: view.id })
        }
    }

}