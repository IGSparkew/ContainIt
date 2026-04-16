import { LowSync } from "lowdb";
import { ILowDbClient } from "../../application/providers/ILowDbClient.js";
import { DbData } from "../../domain/models/DbData.js";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { JSONFileSync } from "lowdb/node";

const path = 'data/db.json';

export class LowDbClient implements ILowDbClient {
    private db: LowSync<DbData>

    constructor() {
        if (existsSync(path)) {
            try {
                JSON.parse(readFileSync(path, 'utf-8'))
            } catch {
                unlinkSync(path)
            }
        }
    
        if (!existsSync(path)) {
            writeFileSync(path, '{ "instances": [], "volumes": [], "networks": [] }', { encoding: 'utf8' })
        }
        const adapter = new JSONFileSync<DbData>(path)
        this.db = new LowSync(adapter, { instances: [], volumes: [], networks: [] })
        this.db.read()
    }

    getDb(): LowSync<DbData> {
        return this.db;
    }

}