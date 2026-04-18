import { describe, it, expect } from 'vitest';
import { GetInstanceByIdUseCase } from '../../../src/application/usecases/instances/impl/GetInstanceByIdUseCase.js';
import { makeInstanceRepoMock, makeInstance } from '../../helpers/mocks.js';

describe('GetInstanceByIdUseCase', () => {
    it('returns the instance when found', async () => {
        const repo = makeInstanceRepoMock();
        const inst = makeInstance({ id: 'x' });
        (repo.getById as any).mockReturnValue(inst);

        const result = await new GetInstanceByIdUseCase(repo).execute('x');

        expect(result).toBe(inst);
        expect(repo.getById).toHaveBeenCalledWith('x');
    });

    it('returns undefined when not found', async () => {
        const repo = makeInstanceRepoMock();
        const result = await new GetInstanceByIdUseCase(repo).execute('missing');
        expect(result).toBeUndefined();
    });
});
