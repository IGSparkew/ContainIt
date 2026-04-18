import { describe, it, expect, beforeEach } from 'vitest';
import { CreateInstanceUseCase } from '../../../src/application/usecases/instances/impl/CreateInstanceUseCase.js';
import type { IInstanceRepository } from '../../../src/application/repositories/IInstanceRepository.js';
import type { IVolumeRepository } from '../../../src/application/repositories/IVolumeRepository.js';
import type { INetworkRepository } from '../../../src/application/repositories/INetworkRepository.js';
import type { IDockerPort } from '../../../src/application/repositories/IDockerPort.js';
import {
    makeInstanceRepoMock,
    makeVolumeRepoMock,
    makeNetworkRepoMock,
    makeDockerPortMock,
    makeInstance,
    makeNetwork,
    makeVolume,
} from '../../helpers/mocks.js';

describe('CreateInstanceUseCase', () => {
    let instanceRepo: IInstanceRepository;
    let volumeRepo: IVolumeRepository;
    let networkRepo: INetworkRepository;
    let dockerPort: IDockerPort;
    let usecase: CreateInstanceUseCase;

    beforeEach(() => {
        instanceRepo = makeInstanceRepoMock();
        volumeRepo = makeVolumeRepoMock();
        networkRepo = makeNetworkRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new CreateInstanceUseCase(instanceRepo, volumeRepo, networkRepo, dockerPort);
    });

    it('throws when an instance with the same name already exists', async () => {
        (instanceRepo.getAll as any).mockReturnValue([makeInstance({ name: 'dupe' })]);
        await expect(
            usecase.execute({ name: 'dupe', type: 'postgres', port: 5432, password: 'secret123' })
        ).rejects.toThrow(/already exists/);
    });

    describe('DB instance branch', () => {
        it('creates a DB instance with a new volume', async () => {
            const result = await usecase.execute({
                name: 'pg1',
                type: 'postgres',
                port: 5432,
                password: 'secret123',
            });

            expect(dockerPort.checkPortAvailable).toHaveBeenCalledWith(5432);
            expect(dockerPort.createInstance).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'pg1' }),
                expect.any(String),
                false,
                undefined,
            );
            expect(volumeRepo.save).toHaveBeenCalled();
            expect(instanceRepo.save).toHaveBeenCalled();
            expect(result.status).toBe('stopped');
            expect(result.containerId).toBe('container-xyz');
        });

        it('links an existing orphan volume when volumeId provided', async () => {
            const orphan = makeVolume({ id: 'vol-orphan', orphan: true });
            (volumeRepo.getById as any).mockReturnValue(orphan);

            await usecase.execute({
                name: 'pg1',
                type: 'postgres',
                port: 5432,
                password: 'secret123',
                volumeId: 'vol-orphan',
            });

            expect(dockerPort.createInstance).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(String),
                true,
                orphan.name,
            );
            expect(volumeRepo.linkVolume).toHaveBeenCalledWith('vol-orphan', 'container-xyz');
            expect(volumeRepo.save).not.toHaveBeenCalled();
        });

        it('throws when volumeId not found', async () => {
            (volumeRepo.getById as any).mockReturnValue(undefined);
            await expect(
                usecase.execute({
                    name: 'pg1',
                    type: 'postgres',
                    port: 5432,
                    password: 'secret123',
                    volumeId: 'missing',
                })
            ).rejects.toThrow(/not found/);
        });

        it('throws when volume is not orphan', async () => {
            (volumeRepo.getById as any).mockReturnValue(makeVolume({ orphan: false }));
            await expect(
                usecase.execute({
                    name: 'pg1',
                    type: 'postgres',
                    port: 5432,
                    password: 'secret123',
                    volumeId: 'vol-1',
                })
            ).rejects.toThrow(/already linked/);
        });

        it.each([
            [{ name: 'x', type: 'postgres' as const, password: 'secret123' }, /port is required/i],
            [{ name: 'x', type: 'postgres' as const, port: 5432 }, /password is required/i],
            [{ name: 'x', type: 'postgres' as const, port: 80, password: 'secret123' }, /Port.*invalid/i],
            [{ name: 'x', type: 'postgres' as const, port: 70000, password: 'secret123' }, /Port.*invalid/i],
            [{ name: 'x', type: 'unknown' as any, port: 5432, password: 'secret123' }, /not supported/i],
            [{ name: 'x', type: 'postgres' as const, port: 5432, password: '123' }, /too short/i],
        ])('rejects invalid DB dto %#', async (dto, re) => {
            await expect(usecase.execute(dto as any)).rejects.toThrow(re);
        });
    });

    describe('Admin tool branch', () => {
        it('throws when no networkId provided', async () => {
            await expect(
                usecase.execute({ name: 'adm', type: 'adminer' })
            ).rejects.toThrow(/network is required/i);
        });

        it('throws when network not found', async () => {
            (networkRepo.getById as any).mockReturnValue(undefined);
            await expect(
                usecase.execute({ name: 'adm', type: 'adminer', networkId: 'missing' })
            ).rejects.toThrow(/Network.*not found/);
        });

        it('creates an adminer admin tool', async () => {
            (networkRepo.getById as any).mockReturnValue(makeNetwork({ dockerId: 'docker-net-1' }));

            const result = await usecase.execute({ name: 'adm', type: 'adminer', networkId: 'net-1' });

            expect(dockerPort.findFreePort).toHaveBeenCalledWith(10000);
            expect(dockerPort.createAdminTool).toHaveBeenCalledWith(
                'adminer',
                'adm',
                10001,
                'docker-net-1',
                [],
            );
            expect(dockerPort.startInstance).toHaveBeenCalledWith('admin-container-id');
            expect(result.status).toBe('running');
            expect(result.networkId).toBe('net-1');
        });

        it('throws when mongo-express cannot find mongo in network', async () => {
            (networkRepo.getById as any).mockReturnValue(makeNetwork({ instance: [] }));
            (instanceRepo.getAll as any).mockReturnValue([]);

            await expect(
                usecase.execute({ name: 'mx', type: 'mongo-express', networkId: 'net-1' })
            ).rejects.toThrow(/No MongoDB instance/);
        });

        it('builds mongo-express env with mongo url', async () => {
            const mongo = makeInstance({ id: 'm1', type: 'mongo', name: 'mydb', password: 'pw' });
            (networkRepo.getById as any).mockReturnValue(makeNetwork({ instance: ['m1'] }));
            (instanceRepo.getAll as any).mockReturnValue([mongo]);

            await usecase.execute({ name: 'mx', type: 'mongo-express', networkId: 'net-1' });

            expect(dockerPort.createAdminTool).toHaveBeenCalledWith(
                'mongo-express',
                'mx',
                10001,
                'docker-net-1',
                expect.arrayContaining([
                    expect.stringContaining('ME_CONFIG_MONGODB_URL=mongodb://admin:pw@containit-mydb:27017'),
                    'ME_CONFIG_BASICAUTH=false',
                ]),
            );
        });
    });
});
