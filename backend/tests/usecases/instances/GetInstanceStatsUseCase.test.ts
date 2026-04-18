import { describe, it, expect, beforeEach } from 'vitest';
import { GetInstanceStatsUseCase } from '../../../src/application/usecases/instances/impl/GetInstanceStatsUseCase.js';
import type { IInstanceRepository } from '../../../src/application/repositories/IInstanceRepository.js';
import type { IDockerPort } from '../../../src/application/repositories/IDockerPort.js';
import { makeInstanceRepoMock, makeDockerPortMock, makeInstance } from '../../helpers/mocks.js';

describe('GetInstanceStatsUseCase', () => {
    let instanceRepo: IInstanceRepository;
    let dockerPort: IDockerPort;
    let usecase: GetInstanceStatsUseCase;

    beforeEach(() => {
        instanceRepo = makeInstanceRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new GetInstanceStatsUseCase(instanceRepo, dockerPort);
    });

    it('throws when instance not found', async () => {
        (instanceRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('missing')).rejects.toThrow(/introuvable/);
    });

    it('throws when instance is stopped', async () => {
        (instanceRepo.getById as any).mockReturnValue(makeInstance({ status: 'stopped' }));
        await expect(usecase.execute('inst-1')).rejects.toThrow(/arrêtée/);
    });

    it('returns stats when running', async () => {
        const inst = makeInstance({ status: 'running', containerId: 'c-1' });
        (instanceRepo.getById as any).mockReturnValue(inst);
        const stats = { cpu: 10 } as any;
        (dockerPort.getStats as any).mockResolvedValue(stats);

        const result = await usecase.execute(inst.id);

        expect(dockerPort.getStats).toHaveBeenCalledWith('c-1');
        expect(result).toBe(stats);
    });
});
