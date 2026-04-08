<script lang="ts">
    import { networkStore } from "../stores/networkStore";

    const networkForm = $state<{id: string | undefined}>(getDefaultNetworkForm());

    function getDefaultNetworkForm() {
        return { id: undefined }
    }

    type Props = {
        selectedRows: string[]
        onDelete: () => void
        onStats: () => void
        cantGetStats: boolean
    }

    const { selectedRows, onDelete, onStats, cantGetStats }: Props = $props();

    // Réseaux auxquels l'instance sélectionnée est connectée
    const instanceNetworks = $derived(
        selectedRows.length === 1
            ? $networkStore.filter(n => n.instance.includes(selectedRows[0]))
            : []
    )

    // Réseaux disponibles pour l'attach (ceux où l'instance n'est pas encore)
    const availableNetworks = $derived(
        $networkStore.filter(n => !n.instance.includes(selectedRows[0]))
    )

    async function connectNetwork() {
        if (networkForm.id != undefined) {
            await networkStore.attachContainer(networkForm.id, selectedRows[0])
            networkForm.id = undefined;
        }
    }

    async function disconnectNetwork(networkId: string) {
        await networkStore.detachContainer(networkId, selectedRows[0])
    }
</script>

{#if selectedRows.length > 0}
    <section class="mb-3 flex flex-wrap items-center gap-2">
        <button class="btn btn-error" onclick={onDelete}>Delete</button>
        <button class="btn btn-primary" disabled="{cantGetStats}" onclick={onStats}>Stats</button>

        {#if !cantGetStats}
            {#each instanceNetworks as network (network.id)}
                <div class="flex items-center gap-1">
                    <span class="badge badge-outline">{network.name}</span>
                    <button class="btn btn-sm btn-warning" onclick={() => disconnectNetwork(network.id)}>Detach</button>
                </div>
            {/each}

            {#if availableNetworks.length > 0 && instanceNetworks.length == 0}
                <form class="flex flex-row gap-1" onsubmit={(e) => { e.preventDefault(); connectNetwork(); }}>
                    <select class="select select-sm" bind:value={networkForm.id}>
                        <option value={undefined} disabled selected>Pick a network</option>
                        {#each availableNetworks as network (network.id)}
                            <option value={network.id}>{network.name}</option>
                        {/each}
                    </select>
                    <button class="btn btn-sm btn-primary" type="submit">Connect</button>
                </form>
            {/if}
        {/if}
    </section>
{/if}
