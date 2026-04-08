<script lang="ts">
    import { onMount } from "svelte";
    import { networkStore } from "../../stores/networkStore";
    import { instanceStore } from "../../stores/instanceStore";
    import NetworkRow from "./networkRow.svelte";

    const {error, isLoading} = networkStore;

    onMount(() => {
        networkStore.fetchNetworks();
        instanceStore.fetchAllInstances();
    });

    let selectedRows = $state<string[]>([]);

    function toggleSelection(id: string) {
        if (selectedRows.includes(id)) {
            selectedRows = selectedRows.filter(i => i !== id)
        } else {
            selectedRows = [...selectedRows, id]
        }
    }

    const selectedNetwork = $derived(
        selectedRows.length === 1
            ? $networkStore.find(n => n.id === selectedRows[0])
            : undefined
    )

    const selectedNetworkInstances = $derived(
        selectedNetwork
            ? $instanceStore.filter(i => selectedNetwork.instance.includes(i.id))
            : []
    )

    async function deleteSelected() {
        for (const id of selectedRows) {
            await networkStore.deleteNetwork(id);
        }
        selectedRows = [];
    }
</script>

{#if $isLoading}
    <div aria-label="status" class="status status-xs"></div>
{:else}

{#if $error}
    <div role="alert" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{$error}</span>
    </div>
{/if}

{#if selectedRows.length > 0}
    <section class="mb-3">
        <button class="btn btn-error" onclick={deleteSelected}>Delete</button>
    </section>
{/if}

<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Driver</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
        {#each $networkStore as network (network.id)}
           <NetworkRow network={network} selectedRows={selectedRows} toggleSelection={toggleSelection} />
        {/each}
    </tbody>
  </table>
</div>

{#if selectedNetwork && selectedNetworkInstances.length > 0}
    <section class="mt-4">
        <h2 class="text-sm font-semibold mb-2 opacity-60">Instances connectées à <span class="font-bold">{selectedNetwork.name}</span></h2>
        <div class="flex flex-wrap gap-3">
            {#each selectedNetworkInstances as instance (instance.id)}
                <div class="card bg-base-100 border border-base-content/10 w-48">
                    <div class="card-body p-4 gap-1">
                        <h3 class="card-title text-sm">{instance.name}</h3>
                        <span class="badge badge-outline badge-sm">{instance.type}</span>
                        <p class="text-xs opacity-60">Port {instance.port}</p>
                    </div>
                </div>
            {/each}
        </div>
    </section>
{:else if selectedNetwork && selectedNetworkInstances.length === 0}
    <section class="mt-4">
        <p class="text-sm opacity-50">Aucune instance connectée à <span class="font-semibold">{selectedNetwork.name}</span>.</p>
    </section>
{/if}

{/if}