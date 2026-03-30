<script lang="ts">
    import StatsCard from "./StatsCard.svelte";
    import { instanceStore } from "../stores/instanceStore";
    
    const {stats} = instanceStore;

    $effect(() => {
        if (selectedRows.length !== 1) {
            stats.set(null);
        }
    })

    type Props = {
        selectedRows: string[]
        onDelete: () => void
    }

    const { selectedRows, onDelete }: Props = $props();

    const selectedInstance = $derived(
        $instanceStore.find(instance => instance.id == selectedRows[0])
    )

    const cantGetStats = $derived(
        selectedRows.length !== 1 || selectedInstance?.status === 'stopped'
    )

    function onStats() {
        instanceStore.fetchStatInstance(selectedRows[0]);
    }

</script>

{#if $stats !== null && !cantGetStats}
    <section class="flex gap-1.5 my-1.5">
        <StatsCard name="Cpu" value={$stats.cpu} iconType="cpu"/>
        <StatsCard name="Ram" value={$stats.memory} iconType="ram"/>
    </section>
{/if}

{#if selectedRows.length > 0}
    <section class="mb-3">
        <button class="btn btn-error" onclick={onDelete}>Delete</button>
        <button class="btn btn-primary" disabled="{cantGetStats}" onclick={onStats}>Stats</button>
    </section>
{/if}