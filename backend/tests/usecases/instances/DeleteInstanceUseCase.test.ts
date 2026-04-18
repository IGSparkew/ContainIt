import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteInstanceUseCase } from '../../../src/application/usecases/instances/impl/DeleteInstanceUseCase.js';
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

describe('DeleteInstanceUseCase', () => {
    let instanceRepo: IInstanceRepository;
    let volumeRepo: IVolumeRepository;
    let networkRepo: INetworkRepository;
    let dockerPort: IDockerPort;
    let usecase: DeleteInstanceUseCase;

    beforeEach(() => {
        instanceRepo = makeInstanceRepoMock();
        volumeRepo = makeVolumeRepoMock();
        networkRepo = makeNetworkRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new DeleteInstanceUseCase(instanceRepo, volumeRepo, networkRepo, dockerPort);
    });

    it('throws when instance not found', async () => {
        (instanceRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('missing', false)).rejects.toThrow(/not found/);
    });

    describe('admin tool branch', () => {
        it('disconnects and detaches from network then deletes container', async () => {
            const admin = makeInstance({ type: 'adminer', networkId: 'net-1', containerId: 'c-admin' });
            (instanceRepo.getById as any).mockReturnValue(admin);
            (networkRepo.getById as any).mockReturnValue(makeNetwork({ id: 'net-1', dockerId: 'docker-net-1' }));

            await usecase.execute(admin.id, false);

            expect(dockerPort.disconnectContainer).toHaveBeenCalledWith('docker-net-1', 'c-admin');
            expect(networkRepo.detachContainer).toHaveBeenCalledWith('net-1', 'c-admin');
            expect(dockerPort.deleteInstance).toHaveBeenCalledWith('c-admin', true, undefined);
            expect(instanceRepo.remove).toHaveBeenCalledWith(admin.id);
        });

        it('does not call disconnect when admin has no networkId', async () => {
            const admin = makeInstance({ type: 'adminer', networkId: undefined });
            (instanceRepo.getById as any).mockReturnValue(admin);

            await usecase.execute(admin.id, false);

            expect(dockerPort.disconnectContainer).not.toHaveBeenCalled();
            expect(networkRepo.detachContainer).not.toHaveBeenCalled();
            expect(dockerPort.deleteInstance).toHaveBeenCalled();
        });

        it('does not call disconnect when network not found in repo', async () => {
            const admin = makeInstance({ type: 'adminer', networkId: 'net-missing' });
            (instanceRepo.getById as any).mockReturnValue(admin);
            (networkRepo.getById as any).mockReturnValue(undefined);

            await usecase.execute(admin.id, false);

            expect(dockerPort.disconnectContainer).not.toHaveBeenCalled();
            expect(networkRepo.detachContainer).not.toHaveBeenCalled();
        });
    });

    describe('DB instance branch', () => {
        it('stops container when running before delete', async () => {
            const inst = makeInstance({ containerId: 'c-db' });
            (instanceRepo.getById as any).mockReturnValue(inst);
            (volumeRepo.getByContainerId as any).mockReturnValue(makeVolume({ name: 'vol-x' }));
            (dockerPort.getStatus as any).mockResolvedValue('running');

            await usecase.execute(inst.id, false);

            expect(dockerPort.stopInstance).toHaveBeenCalledWith('c-db');
            expect(dockerPort.deleteInstance).toHaveBeenCalledWith('c-db', false, 'vol-x');
            expect(volumeRepo.remove).toHaveBeenCalled();
            expect(volumeRepo.unlinkVolume).not.toHaveBeenCalled();
        });

        it('skips stop when container already stopped', async () => {
            (instanceRepo.getById as any).mockReturnValue(makeInstance());
            (dockerPort.getStatus as any).mockResolvedValue('stopped');

            await usecase.execute('inst-1', true);

            expect(dockerPort.stopInstance).not.toHaveBeenCalled();
        });

        it('unlinks volume when keepVolume=true', async () => {
            (instanceRepo.getById as any).mockReturnValue(makeInstance());
            (volumeRepo.getByContainerId as any).mockReturnValue(makeVolume({ id: 'vol-1' }));
            (dockerPort.getStatus as any).mockResolvedValue('stopped');

            await usecase.execute('inst-1', true);

            expect(volumeRepo.unlinkVolume).toHaveBeenCalledWith('vol-1');
            expect(volumeRepo.remove).not.toHaveBeenCalled();
        });

        it('passes undefined volumeName when no volume exists', async () => {
            (instanceRepo.getById as any).mockReturnValue(makeInstance());
            (volumeRepo.getByContainerId as any).mockReturnValue(undefined);
            (dockerPort.getStatus as any).mockResolvedValue('stopped');

            await usecase.execute('inst-1', false);

            expect(dockerPort.deleteInstance).toHaveBeenCalledWith('container-1', false, undefined);
        });

        it('detaches container from all associated networks', async () => {
            const inst = makeInstance({ containerId: 'c-db' });
            (instanceRepo.getById as any).mockReturnValue(inst);
            (dockerPort.getStatus as any).mockResolvedValue('stopped');
            (networkRepo.getByContainerId as any).mockReturnValue([
                makeNetwork({ id: 'net-1' }),
                makeNetwork({ id: 'net-2' }),
            ]);

            await usecase.execute(inst.id, false);

            expect(networkRepo.detachContainer).toHaveBeenCalledWith('net-1', 'c-db');
            expect(networkRepo.detachContainer).toHaveBeenCalledWith('net-2', 'c-db');
        });

        it('does not call detachContainer when instance belongs to no network', async () => {
            (instanceRepo.getById as any).mockReturnValue(makeInstance());
            (dockerPort.getStatus as any).mockResolvedValue('stopped');
            (networkRepo.getByContainerId as any).mockReturnValue([]);

            await usecase.execute('inst-1', false);

            expect(networkRepo.detachContainer).not.toHaveBeenCalled();
        });
    });
});
