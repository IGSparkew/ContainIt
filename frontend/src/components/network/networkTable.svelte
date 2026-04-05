<script lang="ts">
    import { onMount } from "svelte";
    import { networkStore } from "../../stores/networkStore";
    import NetworkRow from "./networkRow.svelte";

    const {error, isLoading} = networkStore;

    onMount(() => {
        networkStore.fetchNetworks()
    });

    let selectedRows = $state<string[]>([]);

    function toggleSelection(id: string) {
        if (selectedRows.includes(id)) {
            selectedRows = selectedRows.filter(i => i !== id)
        } else {
            selectedRows = [...selectedRows, id]
        }
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
           <NetworkRow network= {network} selectedRows={selectedRows} toggleSelection={toggleSelection} />
        {/each}
    </tbody>
  </table>
</div>

{/if}