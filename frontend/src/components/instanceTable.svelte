<script lang="ts">
    import { onMount } from "svelte";
    import { instanceStore } from "../stores/store";
    import InstanceToolbar from "./InstanceToolbar.svelte";
    import InstanceRow from "./instanceRow.svelte";

    const { isLoading, error } = instanceStore

    onMount(() => {
        instanceStore.fetchAllInstances()
    });

    let selectedRows = $state<string[]>([]);

    function toggleSelection(id: string) {
        if (selectedRows.includes(id)) {
            selectedRows = selectedRows.filter(i => i !== id)
        } else {
            selectedRows = [...selectedRows, id]
        }
    }

    function deleteInstances() {
        selectedRows.forEach(id => instanceStore.deleteInstance(id))
        selectedRows = []
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

<InstanceToolbar onDelete={deleteInstances} selectedRows={selectedRows} />

<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Type</th>
        <th>Port</th>
        <th>Status</th>
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
{/if}