<script lang="ts">
    import { onMount } from "svelte";
    import { instanceStore } from "../../stores/instanceStore";
    import InstanceToolbar from "./InstanceToolbar.svelte";
    import InstanceRow from "./instanceRow.svelte";
    import StatsCard from "../shared/StatsCard.svelte";
    import InstanceConnectionInfo from "./InstanceConnectionInfo.svelte";
    import { openDeleteConfirmModal } from "../../stores/storeModal";

    const { isLoading, error, instancesIdToDelete, stats } = instanceStore

    onMount(() => {
        instanceStore.fetchAllInstances()
    });

    let selectedRows = $state<string[]>([]);

    const selectedInstance = $derived(
        $instanceStore.find(i => i.id === selectedRows[0])
    )

    const cantGetStats = $derived(
        selectedRows.length !== 1 || selectedInstance?.status === 'stopped'
    )

    $effect(() => {
        if (selectedRows.length !== 1) {
            stats.set(null);
        }
    })

    function toggleSelection(id: string) {
        if (selectedRows.includes(id)) {
            selectedRows = selectedRows.filter(i => i !== id)
        } else {
            selectedRows = [...selectedRows, id]
        }
    }

    function deleteInstances() {
        instancesIdToDelete.set([...selectedRows]);
        openDeleteConfirmModal.set(true);
        selectedRows = []
    }

    function onStats() {
        instanceStore.fetchStatInstance(selectedRows[0]);
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

<InstanceToolbar onDelete={deleteInstances} {onStats} {cantGetStats} selectedRows={selectedRows} />

<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
    <table class="table">
        <thead>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Type</th>
                <th>Port</th>
                <th>Status</th>
                <th>Networks</th>
                <th></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each $instanceStore as instance (instance.id)}
                <InstanceRow instance={instance} toggleSelection={toggleSelection} selectedRows={selectedRows} />
            {/each}
        </tbody>
    </table>
</div>

{#if selectedRows.length === 1 && selectedInstance}
    <InstanceConnectionInfo instance={selectedInstance} />
{/if}

{#if $stats !== null && selectedInstance}
    <section class="mt-4">
        <h2 class="text-sm font-semibold mb-2 opacity-60">Stats de <span class="font-bold">{selectedInstance.name}</span></h2>
        <div class="flex gap-3">
            <StatsCard name="Cpu" value={$stats.cpu} iconType="cpu"/>
            <StatsCard name="Ram" value={$stats.memory} iconType="ram"/>
        </div>
    </section>
{/if}

{/if}
