<script lang="ts">
    import { onMount } from "svelte";
    import InstanceDeleteModal from "../components/instance/modal/instanceDeleteModal.svelte";
    import InstanceTable from "../components/instance/instanceTable.svelte";
    import { openDeleteConfirmModal } from "../stores/storeModal";
    import { networkStore } from "../stores/networkStore";

    let deleteModal : InstanceDeleteModal;

    onMount(() => {
        networkStore.fetchNetworks();
    });
</script>

<div class="mt-2.5 ml-1.5">
  <InstanceTable />
</div>

{#if $openDeleteConfirmModal}
  <InstanceDeleteModal bind:this={deleteModal} />
{/if}