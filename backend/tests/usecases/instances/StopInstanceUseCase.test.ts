import { describe, it, expect, beforeEach } from 'vitest';
import { StopInstanceUseCase } from '../../../src/application/usecases/instances/impl/StopInstanceUseCase.js';
import type { IInstanceRepository } from '../../../src/application/repositories/IInstanceRepository.js';
import type { IDockerPort } from '../../../src/application/repositories/IDockerPort.js';
import { makeInstanceRepoMock, makeDockerPortMock, makeInstance } from '../../helpers/mocks.js';

describe('StopInstanceUseCase', () => {
    let instanceRepo: IInstanceRepository;
    let dockerPort: IDockerPort;
    let usecase: StopInstanceUseCase;

    beforeEach(() => {
        instanceRepo = makeInstanceRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new StopInstanceUseCase(instanceRepo, dockerPort);
    });

    it('throws when instance not found', async () => {
        (instanceRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('missing')).rejects.toThrow(/introuvable/);
    });

    it('throws when already stopped', async () => {
        (instanceRepo.getById as any).mockReturnValue(makeInstance({ status: 'stopped' }));
        await expect(usecase.execute('inst-1')).rejects.toThrow(/déjà arrêtée/);
    });

    it('stops container and updates status', async () => {
        const inst = makeInstance({ status: 'running', containerId: 'c-1' });
        (instanceRepo.getById as any).mockReturnValue(inst);
        (instanceRepo.update as any).mockReturnValue({ ...inst, status: 'stopped' });

        const result = await usecase.execute(inst.id);

        expect(dockerPort.stopInstance).toHaveBeenCalledWith('c-1');
        expect(instanceRepo.update).toHaveBeenCalledWith(inst.id, { status: 'stopped' });
        expect(result.status).toBe('stopped');
    });
});
