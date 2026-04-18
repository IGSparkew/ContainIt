import { describe, it, expect } from 'vitest';
import { GetOrphanVolumesUseCase } from '../../../src/application/usecases/volumes/impl/GetOrphanVolumesUseCase.js';
import { makeVolumeRepoMock, makeVolume } from '../../helpers/mocks.js';

describe('GetOrphanVolumesUseCase', () => {
    it('returns only orphan volumes', () => {
        const repo = makeVolumeRepoMock();
        (repo.getAll as any).mockReturnValue([
            makeVolume({ id: 'a', orphan: true }),
            makeVolume({ id: 'b', orphan: false }),
            makeVolume({ id: 'c', orphan: true }),
        ]);

        const result = new GetOrphanVolumesUseCase(repo).execute();

        expect(result.map(v => v.id)).toEqual(['a', 'c']);
    });

    it('returns empty array when no orphans', () => {
        const repo = makeVolumeRepoMock();
        (repo.getAll as any).mockReturnValue([makeVolume({ orphan: false })]);
        expect(new GetOrphanVolumesUseCase(repo).execute()).toEqual([]);
    });
});
