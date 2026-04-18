import { vi } from 'vitest';
import type { IInstanceRepository } from '../../src/application/repositories/IInstanceRepository.js';
import type { IVolumeRepository } from '../../src/application/repositories/IVolumeRepository.js';
import type { INetworkRepository } from '../../src/application/repositories/INetworkRepository.js';
import type { IDockerPort } from '../../src/application/repositories/IDockerPort.js';
import type { Instance } from '../../src/domain/models/instance.js';
import type { Volume } from '../../src/domain/models/volumes.js';
import type { Network } from '../../src/domain/models/networks.js';

export function makeInstanceRepoMock(): IInstanceRepository {
    return {
        getAll: vi.fn(() => []),
        getById: vi.fn(() => undefined),
        save: vi.fn((instance: Instance) => instance),
        update: vi.fn((_id: string, _data: Partial<Instance>) => ({} as Instance)),
        remove: vi.fn(),
    };
}

export function makeVolumeRepoMock(): IVolumeRepository {
    return {
        getAll: vi.fn(() => []),
        getById: vi.fn(() => undefined),
        getByContainerId: vi.fn(() => undefined),
        save: vi.fn((volume: Volume) => volume),
        update: vi.fn((_id: string, _data: Partial<Volume>) => ({} as Volume)),
        linkVolume: vi.fn((_id: string, _containerId: string) => ({} as Volume)),
        unlinkVolume: vi.fn((_id: string) => ({} as Volume)),
        remove: vi.fn(),
    };
}

export function makeNetworkRepoMock(): INetworkRepository {
    return {
        getAll: vi.fn(() => []),
        getById: vi.fn(() => undefined),
        getByContainerId: vi.fn(() => []),
        save: vi.fn((network: Network) => network),
        update: vi.fn((_id: string, _data: Partial<Network>) => ({} as Network)),
        attachContainer: vi.fn((_id: string, _containerId: string) => ({} as Network)),
        detachContainer: vi.fn((_id: string, _containerId: string) => ({} as Network)),
        remove: vi.fn(),
    };
}

export function makeDockerPortMock(): IDockerPort {
    return {
        createInstance: vi.fn(async () => ({ containerId: 'container-xyz', volumeName: 'vol-xyz' })),
        startInstance: vi.fn(async () => {}),
        stopInstance: vi.fn(async () => {}),
        deleteInstance: vi.fn(async () => {}),
        getStatus: vi.fn(async () => 'running' as const),
        getStats: vi.fn(async () => ({} as any)),
        createNetwork: vi.fn(async () => ({ dockerId: 'docker-net-id' })),
        removeNetwork: vi.fn(async () => {}),
        connectContainer: vi.fn(async () => {}),
        disconnectContainer: vi.fn(async () => {}),
        createAdminTool: vi.fn(async () => 'admin-container-id'),
        findFreePort: vi.fn(async () => 10001),
        checkPortAvailable: vi.fn(async () => {}),
    };
}

export function makeInstance(overrides: Partial<Instance> = {}): Instance {
    return {
        id: 'inst-1',
        name: 'my-db',
        type: 'postgres',
        image: 'postgres:latest',
        port: 5432,
        password: 'secret123',
        containerId: 'container-1',
        status: 'stopped',
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

export function makeVolume(overrides: Partial<Volume> = {}): Volume {
    return {
        id: 'vol-1',
        containerId: 'container-1',
        name: 'vol-data',
        type: 'postgres',
        createdAt: new Date().toISOString(),
        orphan: false,
        ...overrides,
    };
}

export function makeNetwork(overrides: Partial<Network> = {}): Network {
    return {
        id: 'net-1',
        name: 'my-net',
        driver: 'bridge',
        dockerId: 'docker-net-1',
        instance: [],
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}
