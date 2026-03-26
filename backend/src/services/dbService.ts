import { injectable } from 'tsyringe'
import { JSONFileSync } from 'lowdb/node'
import { Instance } from '../models/instance.js'
import { LowSync } from 'lowdb'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'

type DbData = { instances: Instance[] }
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
    writeFileSync(path, '{ "instances": [] }', { encoding: 'utf8' })
  }


    const adapter = new JSONFileSync<DbData>(path)
    this.db = new LowSync(adapter, { instances: [] })
    this.db.read()
  }

  getAll(): Instance[] {
    this.db.read()
    return this.db.data.instances
  }

  getById(id: string): Instance | undefined {
    this.db.read()
    return this.db.data.instances.find(i => i.id === id)
  }

  save(instance: Instance): Instance {
    this.db.read()
    this.db.data.instances.push(instance)
    this.db.write()
    return instance
  }

  update(id: string, data: Partial<Instance>): Instance {
    this.db.read()
    const index = this.db.data.instances.findIndex(i => i.id === id)
    if (index === -1) throw new Error(`Instance ${id} introuvable`)
    this.db.data.instances[index] = { ...this.db.data.instances[index], ...data }
    this.db.write()
    return this.db.data.instances[index];
  }

  remove(id: string): void {
    this.db.read()
    this.db.data.instances = this.db.data.instances.filter(i => i.id !== id)
    this.db.write()
  }
}