import { injectable, inject } from 'tsyringe'
import { DbService } from './dbService.js'
import { InstanceStatus, InstanceType } from '../models/instance.js'

import * as net from 'net'
import { InstanceService } from './instanceService.js'

const SUPPORTED_IMAGES: InstanceType[] = ['postgres', 'mysql', 'mongo', 'redis']
const NAME_REGEX = /^[a-zA-Z0-9-_]+$/

@injectable()
export class ValidationService {
  constructor(
    @inject(InstanceService) private instanceService: InstanceService
  ) {}

  // Port entre 1024 et 65535
  checkPortRange(port: number): void {
    if (port < 1024 || port > 65535) {
      throw new Error(`Port ${port} invalide — doit être entre 1024 et 65535`)
    }
  }

  // Port libre sur la machine
  checkPortAvailable(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = net.createServer()

      server.once('error', () => {
        reject(new Error(`Port ${port} déjà utilisé`))
      })

      server.once('listening', () => {
        server.close()
        resolve()
      })

      server.listen(port)
    })
  }

  // Nom unique dans db.json
  checkNameUnique(name: string): void {
    const existing = this.instanceService.getAll().find(i => i.name === name)
    if (existing) {
      throw new Error(`Une instance avec le nom "${name}" existe déjà`)
    }
  }

  // Nom alphanumérique + tirets + underscores uniquement
  checkNameFormat(name: string): void {
    if (!NAME_REGEX.test(name)) {
      throw new Error(`Nom invalide — uniquement lettres, chiffres, tirets et underscores`)
    }
    if (name.length < 2 || name.length > 32) {
      throw new Error(`Nom invalide — entre 2 et 32 caractères`)
    }
  }

  // Type dans la whitelist
  checkImageSupported(type: string): void {
    if (!SUPPORTED_IMAGES.includes(type as InstanceType)) {
      throw new Error(`Type "${type}" non supporté — valeurs acceptées : ${SUPPORTED_IMAGES.join(', ')}`)
    }
  }

  // Mot de passe suffisamment long
  checkPasswordStrength(password: string): void {
    if (password.length < 6) {
      throw new Error(`Mot de passe trop court — 6 caractères minimum`)
    }
  }

  // Instance existante dans db.json
  checkInstanceExists(id: string): void {
    const instance = this.instanceService.getById(id)
    if (!instance) {
      throw new Error(`Instance "${id}" introuvable`)
    }
  }

  // Statut cohérent avec l'action demandée
  checkInstanceStatus(id: string, expected: InstanceStatus): void {
    const instance = this.instanceService.getById(id)
    if (!instance) {
      throw new Error(`Instance "${id}" introuvable`)
    }
    if (instance.status !== expected) {
      throw new Error(
        `Action impossible — l'instance est "${instance.status}", statut attendu : "${expected}"`
      )
    }
  }
}