<script lang="ts">
    import type { Instance } from "../../types/instance";
    import { isAdminType } from "../../types/instance";

    type Props = { instance: Instance }
    const { instance }: Props = $props();

    let showPassword = $state(false);
    let copiedKey = $state<string | null>(null);

    const INTERNAL_PORTS: Record<string, number> = {
        postgres: 5432,
        mysql:    3306,
        mongo:    27017,
        redis:    6379,
    }

    const internalPort = $derived(INTERNAL_PORTS[instance.type] ?? instance.port);
    const dockerHost   = $derived(`containit-${instance.name}`);
    const user         = $derived(instance.type === 'redis' ? null : 'admin');

    const externalConnectionString = $derived((() => {
        switch (instance.type) {
            case 'postgres': return `postgresql://admin:${instance.password}@localhost:${instance.port}/postgres`
            case 'mysql':    return `mysql://admin:${instance.password}@localhost:${instance.port}`
            case 'mongo':    return `mongodb://admin:${instance.password}@localhost:${instance.port}`
            case 'redis':    return `redis://:${instance.password}@localhost:${instance.port}/0`
            default:         return null
        }
    })());

    const dockerConnectionString = $derived((() => {
        switch (instance.type) {
            case 'postgres': return `postgresql://admin:${instance.password}@${dockerHost}:${internalPort}/postgres`
            case 'mysql':    return `mysql://admin:${instance.password}@${dockerHost}:${internalPort}`
            case 'mongo':    return `mongodb://admin:${instance.password}@${dockerHost}:${internalPort}`
            case 'redis':    return `redis://:${instance.password}@${dockerHost}:${internalPort}/0`
            default:         return null
        }
    })());

    async function copy(key: string, text: string) {
        await navigator.clipboard.writeText(text);
        copiedKey = key;
        setTimeout(() => { copiedKey = null }, 2000);
    }


</script>

<section class="mt-4">
    <h2 class="text-sm font-semibold mb-2 opacity-60">
        Connexion — <span class="font-bold">{instance.name}</span>
    </h2>

    {#if isAdminType(instance.type)}
        <div class="flex items-center gap-3 p-3 rounded-box border border-base-content/5 bg-base-100">
            <span class="text-sm opacity-60">URL</span>
            <code class="text-sm flex-1">http://localhost:{instance.port}</code>
            <button
                class="btn btn-xs {copiedKey === 'url' ? 'btn-success' : 'btn-ghost'}"
                onclick={() => copy('url', `http://localhost:${instance.port}`)}
            >{copiedKey === 'url' ? 'Copié !' : 'Copier'}</button>
            <a
                href="http://localhost:{instance.port}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-secondary"
            >Ouvrir</a>
        </div>
    {:else}
        <div class="grid grid-cols-2 gap-3">

            <!-- Depuis la machine hôte -->
            <div class="rounded-box border border-base-content/5 bg-base-100 overflow-hidden">
                <div class="px-3 pt-2 pb-1 text-xs font-semibold opacity-50 uppercase tracking-wide">Depuis votre machine</div>
                <table class="table table-sm">
                    <tbody>
                        <tr>
                            <td class="opacity-60 w-24">Hôte</td>
                            <td><code>localhost</code></td>
                            <td>
                                <button
                                    class="btn btn-xs {copiedKey === 'ext-host' ? 'btn-success' : 'btn-ghost'}"
                                    onclick={() => copy('ext-host', 'localhost')}
                                >{copiedKey === 'ext-host' ? 'Copié !' : 'Copier'}</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="opacity-60">Port</td>
                            <td><code>{instance.port}</code></td>
                            <td>
                                <button
                                    class="btn btn-xs {copiedKey === 'ext-port' ? 'btn-success' : 'btn-ghost'}"
                                    onclick={() => copy('ext-port', String(instance.port))}
                                >{copiedKey === 'ext-port' ? 'Copié !' : 'Copier'}</button>
                            </td>
                        </tr>
                        {#if user}
                            <tr>
                                <td class="opacity-60">User</td>
                                <td><code>{user}</code></td>
                                <td>
                                    <button
                                        class="btn btn-xs {copiedKey === 'ext-user' ? 'btn-success' : 'btn-ghost'}"
                                        onclick={() => copy('ext-user', user!)}
                                    >{copiedKey === 'ext-user' ? 'Copié !' : 'Copier'}</button>
                                </td>
                            </tr>
                        {/if}
                        <tr>
                            <td class="opacity-60">Password</td>
                            <td><code>{showPassword ? instance.password : '••••••••'}</code></td>
                            <td class="flex gap-1">
                                <button class="btn btn-xs btn-ghost" onclick={() => showPassword = !showPassword}>
                                    {showPassword ? 'Masquer' : 'Voir'}
                                </button>
                                <button
                                    class="btn btn-xs {copiedKey === 'pwd' ? 'btn-success' : 'btn-ghost'}"
                                    onclick={() => copy('pwd', instance.password)}
                                >{copiedKey === 'pwd' ? 'Copié !' : 'Copier'}</button>
                            </td>
                        </tr>
                        {#if externalConnectionString}
                            <tr>
                                <td class="opacity-60">URL</td>
                                <td class="max-w-45">
                                    <code class="break-all text-xs">{externalConnectionString}</code>
                                </td>
                                <td>
                                    <button
                                        class="btn btn-xs {copiedKey === 'ext-url' ? 'btn-success' : 'btn-ghost'}"
                                        onclick={() => copy('ext-url', externalConnectionString)}
                                    >{copiedKey === 'ext-url' ? 'Copié !' : 'Copier'}</button>
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <!-- Depuis un outil admin dans Docker -->
            <div class="rounded-box border border-base-content/5 bg-base-100 overflow-hidden">
                <div class="px-3 pt-2 pb-1 text-xs font-semibold opacity-50 uppercase tracking-wide">Depuis Docker</div>
                <table class="table table-sm">
                    <tbody>
                        <tr>
                            <td class="opacity-60 w-24">Hôte</td>
                            <td><code>{dockerHost}</code></td>
                            <td>
                                <button
                                    class="btn btn-xs {copiedKey === 'docker-host' ? 'btn-success' : 'btn-ghost'}"
                                    onclick={() => copy('docker-host', dockerHost)}
                                >{copiedKey === 'docker-host' ? 'Copié !' : 'Copier'}</button>
                            </td>
                        </tr>
                        <tr>
                            <td class="opacity-60">Port</td>
                            <td><code>{internalPort}</code></td>
                            <td>
                                <button
                                    class="btn btn-xs {copiedKey === 'docker-port' ? 'btn-success' : 'btn-ghost'}"
                                    onclick={() => copy('docker-port', String(internalPort))}
                                >{copiedKey === 'docker-port' ? 'Copié !' : 'Copier'}</button>
                            </td>
                        </tr>
                        {#if user}
                            <tr>
                                <td class="opacity-60">User</td>
                                <td><code>{user}</code></td>
                                <td>
                                    <button
                                        class="btn btn-xs {copiedKey === 'docker-user' ? 'btn-success' : 'btn-ghost'}"
                                        onclick={() => copy('docker-user', user!)}
                                    >{copiedKey === 'docker-user' ? 'Copié !' : 'Copier'}</button>
                                </td>
                            </tr>
                        {/if}
                        <tr>
                            <td class="opacity-60">Password</td>
                            <td><code>{showPassword ? instance.password : '••••••••'}</code></td>
                            <td class="flex gap-1">
                                <button class="btn btn-xs btn-ghost" onclick={() => showPassword = !showPassword}>
                                    {showPassword ? 'Masquer' : 'Voir'}
                                </button>
                                <button
                                    class="btn btn-xs {copiedKey === 'pwd' ? 'btn-success' : 'btn-ghost'}"
                                    onclick={() => copy('pwd', instance.password)}
                                >{copiedKey === 'pwd' ? 'Copié !' : 'Copier'}</button>
                            </td>
                        </tr>
                        {#if dockerConnectionString}
                            <tr>
                                <td class="opacity-60">URL</td>
                                <td class="max-w-45">
                                    <code class="break-all text-xs">{dockerConnectionString}</code>
                                </td>
                                <td>
                                    <button
                                        class="btn btn-xs {copiedKey === 'docker-url' ? 'btn-success' : 'btn-ghost'}"
                                        onclick={() => copy('docker-url', dockerConnectionString)}
                                    >{copiedKey === 'docker-url' ? 'Copié !' : 'Copier'}</button>
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    {/if}
</section>
