import { describe, it, expect } from 'vitest';
import { GetAllInstancesUseCase } from '../../../src/application/usecases/instances/impl/GetAllInstancesUseCase.js';
import { makeInstanceRepoMock, makeInstance } from '../../helpers/mocks.js';

describe('GetAllInstancesUseCase', () => {
    it('returns all instances from the repository', async () => {
        const repo = makeInstanceRepoMock();
        const list = [makeInstance({ id: 'a' }), makeInstance({ id: 'b' })];
        (repo.getAll as any).mockReturnValue(list);

        const result = await new GetAllInstancesUseCase(repo).execute();

        expect(result).toEqual(list);
        expect(repo.getAll).toHaveBeenCalledOnce();
    });

    it('returns empty array when no instances', async () => {
        const repo = makeInstanceRepoMock();
        const result = await new GetAllInstancesUseCase(repo).execute();
        expect(result).toEqual([]);
    });
});
