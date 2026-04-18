import { describe, it, expect, beforeEach } from 'vitest';
import { AttachVolumeUseCase } from '../../../src/application/usecases/volumes/impl/AttachVolumeUseCase.js';
import type { IVolumeRepository } from '../../../src/application/repositories/IVolumeRepository.js';
import type { IInstanceRepository } from '../../../src/application/repositories/IInstanceRepository.js';
import { makeVolumeRepoMock, makeInstanceRepoMock, makeVolume, makeInstance } from '../../helpers/mocks.js';

describe('AttachVolumeUseCase', () => {
    let volumeRepo: IVolumeRepository;
    let instanceRepo: IInstanceRepository;
    let usecase: AttachVolumeUseCase;

    beforeEach(() => {
        volumeRepo = makeVolumeRepoMock();
        instanceRepo = makeInstanceRepoMock();
        usecase = new AttachVolumeUseCase(volumeRepo, instanceRepo);
    });

    it('throws when volume id is empty', () => {
        expect(() => usecase.execute('', { instanceId: 'inst-1' })).toThrow(/volume not found/);
    });

    it('throws when instanceId is missing', () => {
        expect(() => usecase.execute('vol-1', { instanceId: '' })).toThrow(/instance not found/);
    });

    it('throws when volume does not exist', () => {
        (volumeRepo.getById as any).mockReturnValue(undefined);
        expect(() => usecase.execute('vol-missing', { instanceId: 'inst-1' })).toThrow(/volume vol-missing not found/);
    });

    it('throws when instance does not exist', () => {
        (volumeRepo.getById as any).mockReturnValue(makeVolume({ orphan: true }));
        (instanceRepo.getById as any).mockReturnValue(undefined);
        expect(() => usecase.execute('vol-1', { instanceId: 'inst-missing' })).toThrow(/instance not found/);
    });

    it('throws when volume is not orphan', () => {
        (volumeRepo.getById as any).mockReturnValue(makeVolume({ orphan: false }));
        (instanceRepo.getById as any).mockReturnValue(makeInstance());
        expect(() => usecase.execute('vol-1', { instanceId: 'inst-1' })).toThrow(/linked with container/);
    });

    it('links the orphan volume to the instance container', () => {
        (volumeRepo.getById as any).mockReturnValue(makeVolume({ id: 'vol-1', orphan: true }));
        (instanceRepo.getById as any).mockReturnValue(makeInstance({ containerId: 'c-target' }));

        usecase.execute('vol-1', { instanceId: 'inst-1' });

        expect(volumeRepo.linkVolume).toHaveBeenCalledWith('vol-1', 'c-target');
    });
});
