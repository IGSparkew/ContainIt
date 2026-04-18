import { describe, it, expect, beforeEach } from 'vitest';
import { StartInstanceUseCase } from '../../../src/application/usecases/instances/impl/StartInstanceUseCase.js';
import type { IInstanceRepository } from '../../../src/application/repositories/IInstanceRepository.js';
import type { IDockerPort } from '../../../src/application/repositories/IDockerPort.js';
import { makeInstanceRepoMock, makeDockerPortMock, makeInstance } from '../../helpers/mocks.js';

describe('StartInstanceUseCase', () => {
    let instanceRepo: IInstanceRepository;
    let dockerPort: IDockerPort;
    let usecase: StartInstanceUseCase;

    beforeEach(() => {
        instanceRepo = makeInstanceRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new StartInstanceUseCase(instanceRepo, dockerPort);
    });

    it('throws when instance not found', async () => {
        (instanceRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('missing')).rejects.toThrow(/introuvable/);
    });

    it('throws when already running', async () => {
        (instanceRepo.getById as any).mockReturnValue(makeInstance({ status: 'running' }));
        await expect(usecase.execute('inst-1')).rejects.toThrow(/déjà en cours/);
    });

    it('starts container and updates status', async () => {
        const inst = makeInstance({ status: 'stopped', containerId: 'c-1' });
        (instanceRepo.getById as any).mockReturnValue(inst);
        (instanceRepo.update as any).mockReturnValue({ ...inst, status: 'running' });

        const result = await usecase.execute(inst.id);

        expect(dockerPort.startInstance).toHaveBeenCalledWith('c-1');
        expect(instanceRepo.update).toHaveBeenCalledWith(inst.id, { status: 'running' });
        expect(result.status).toBe('running');
    });
});
