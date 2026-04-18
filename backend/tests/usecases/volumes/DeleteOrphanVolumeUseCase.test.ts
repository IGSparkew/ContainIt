import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteOrphanVolumeUseCase } from '../../../src/application/usecases/volumes/impl/DeleteOrphanVolumeUseCase.js';
import type { IVolumeRepository } from '../../../src/application/repositories/IVolumeRepository.js';
import { makeVolumeRepoMock, makeVolume } from '../../helpers/mocks.js';

describe('DeleteOrphanVolumeUseCase', () => {
    let volumeRepo: IVolumeRepository;
    let usecase: DeleteOrphanVolumeUseCase;

    beforeEach(() => {
        volumeRepo = makeVolumeRepoMock();
        usecase = new DeleteOrphanVolumeUseCase(volumeRepo);
    });

    it('throws when id is empty', () => {
        expect(() => usecase.execute('')).toThrow(/volume not found/);
    });

    it('throws when volume not found', () => {
        (volumeRepo.getById as any).mockReturnValue(undefined);
        expect(() => usecase.execute('missing')).toThrow(/volume missing not found/);
    });

    it('throws when volume is linked to a container', () => {
        (volumeRepo.getById as any).mockReturnValue(makeVolume({ orphan: false }));
        expect(() => usecase.execute('vol-1')).toThrow(/linked with container/);
        expect(volumeRepo.remove).not.toHaveBeenCalled();
    });

    it('removes the orphan volume', () => {
        (volumeRepo.getById as any).mockReturnValue(makeVolume({ id: 'vol-1', orphan: true }));
        usecase.execute('vol-1');
        expect(volumeRepo.remove).toHaveBeenCalledWith('vol-1');
    });
});
