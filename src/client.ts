import { Client as NotionClient } from "@notionhq/client";
import { defaultDatasource } from "./schema";

export class Notionpress {
    private api_key: string;
    private page_id: string;
    private notionClient: NotionClient;

    constructor(params: { api_key: string, page_id: string }) {
        this.api_key = params.api_key;
        this.page_id = params.page_id;
        this.notionClient = new NotionClient({ auth: this.api_key });


        this.initiateTable()
    }

    private async initiateTable() {
        this.createDataSources()
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

            const data_source = await this.notionClient.dataSources.create({
                parent: { database_id: database.id },
                title: [{ text: { content: database_name } }],
                // @ts-expect-error - Old and New SDK and API calls collide, will fix later
                properties: { ...defaultDatasource }
            })

            // Once we create a new database, update the view to make it more user friendly
            // From Table -> Gallery (Feed is not supported as of this current git commit date)

            await this.notionClient.views.create({
                database_id: database.id,
                data_source_id: data_source.id,
                name: "Feed",
                type: "gallery",
                configuration: {
                    type: "gallery",
                    card_layout: "list",
                    cover_size: "large"
                }
            })
        }
        

    }

}