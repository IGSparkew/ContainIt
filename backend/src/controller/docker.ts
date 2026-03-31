import { inject, injectable } from "tsyringe";
import { DbService } from "../services/dbService.js";
import { DockerService } from "../services/dockerService.js";
import { Context } from "hono";
import { Stats } from '../models/stats.js';
import { InstanceService } from "../services/instanceService.js";

@injectable()
export class DockerController {
    constructor(@inject(InstanceService) private instanceService :InstanceService,
    @inject(DockerService) private dockerService: DockerService
    ) {}


   async start(c: Context) {
        const id = c.req.param('id');

         if (!id) {
            return c.json({"message": "Error wrong id"});
        }

        const instance = this.instanceService.getById(id);
        if (!instance) {
            return c.json({"instance not found": 404});
        }
    
        if (instance.status == 'running') {
            return c.json('instance already running', 409);
        }
    
        await this.dockerService.startInstance(instance.containerId);
    
        const updatedInstance = this.instanceService.update(instance.id, {status: 'running'});
    
        return c.json(updatedInstance, 200);
    }
    
    async stop(c: Context){
        const id = c.req.param('id')

        if (!id) {
             return c.json({"message": "Error wrong id"});
        }
        
        const instance = this.instanceService.getById(id);

        if (!instance) {
            return c.json({"instance not found": 404});
        }
    
        if (instance.status == 'stopped') {
            return c.json('instance already stopped', 409);
        }
    
        await this.dockerService.stopInstance(instance.containerId);
    
        const updatedInstance = this.instanceService.update(instance.id, {status: 'stopped'});
    
        return c.json(updatedInstance, 200);
    }
    
    async stats(c: Context) {
        const id = c.req.param('id')
        
        if (!id) {
             return c.json({"message": "Error wrong id"});
        }

        const instance = this.instanceService.getById(id);
        if (!instance) {
            return c.json({"instance not found": 404});
        }
    
        if (instance.status == 'stopped') {
            return c.json({"message": "Error this instance not running"}, 409);
        }
    
        const data: Stats = await this.dockerService.getStats(instance.containerId);
        return c.json(data, 200);
    }
}