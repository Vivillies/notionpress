import { Client as NotionClient } from "@notionhq/client";

export class Notionpress {
    private api_key: string;
    private notionClient: NotionClient;

    constructor(params: { api_key: string }){
        this.api_key = params.api_key;

        this.notionClient = new NotionClient({auth: this.api_key});


        this.initiateTable()
    }

    private async initiateTable(){
        
    }

    /**
     * 1. Create create database with a schema
     * - Allow custom schema using zod
     * - Allow existing database connection  
    */ 

    /**
     * - Notion to HTML
     * - HTML to blog using tiptap
     */

}