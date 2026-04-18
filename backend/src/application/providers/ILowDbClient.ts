import { LowSync } from "lowdb";
import { DbData } from "../../domain/models/DbData.js";

export interface ILowDbClient {
    getDb() : LowSync<DbData>
}