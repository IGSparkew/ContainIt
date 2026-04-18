import { describe, it, expect, beforeEach } from 'vitest';
import { CreateNetworkUseCase } from '../../../src/application/usecases/networks/impl/CreateNetworkUseCase.js';
import type { INetworkRepository } from '../../../src/application/repositories/INetworkRepository.js';
import type { IDockerPort } from '../../../src/application/repositories/IDockerPort.js';
import { makeNetworkRepoMock, makeDockerPortMock, makeNetwork } from '../../helpers/mocks.js';

describe('CreateNetworkUseCase', () => {
    let networkRepo: INetworkRepository;
    let dockerPort: IDockerPort;
    let usecase: CreateNetworkUseCase;

    beforeEach(() => {
        networkRepo = makeNetworkRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new CreateNetworkUseCase(networkRepo, dockerPort);
    });

    it.each([
        ['a'],
        ['with space'],
        ['has$dollar'],
        ['x'.repeat(33)],
    ])('rejects invalid name %s', async (name) => {
        await expect(usecase.execute({ name, driver: 'bridge' })).rejects.toThrow(/Invalid name/);
    });

    it('rejects duplicate name', async () => {
        (networkRepo.getAll as any).mockReturnValue([makeNetwork({ name: 'mynet' })]);
        await expect(usecase.execute({ name: 'mynet', driver: 'bridge' })).rejects.toThrow(/already exists/);
    });

    it('creates and persists the network', async () => {
        (dockerPort.createNetwork as any).mockResolvedValue({ dockerId: 'docker-xyz' });

        const result = await usecase.execute({ name: 'mynet', driver: 'bridge' });

        expect(dockerPort.createNetwork).toHaveBeenCalledWith('mynet', 'bridge');
        expect(networkRepo.save).toHaveBeenCalled();
        expect(result.name).toBe('mynet');
        expect(result.driver).toBe('bridge');
        expect(result.dockerId).toBe('docker-xyz');
        expect(result.instance).toEqual([]);
    });
});
