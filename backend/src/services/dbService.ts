import { injectable } from 'tsyringe'
import { JSONFileSync } from 'lowdb/node'
import { Instance } from '../models/instance.js'
import { LowSync } from 'lowdb'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { Volume } from '../models/volumes.js'

export type DbData = { instances: Instance[], volumes: Volume[] }
const path = 'data/db.json'

@injectable()
export class DbService {
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
    writeFileSync(path, '{ "instances": [], "volumes": [] }', { encoding: 'utf8' })
  }


    const adapter = new JSONFileSync<DbData>(path)
    this.db = new LowSync(adapter, { instances: [], volumes: [] })
    this.db.read()
  }

  getDb() {
    return this.db;
  }
}