<script lang="ts">
    import ConfirmDeleteModal from "../components/ConfirmDeleteModal.svelte";
    import InstanceTable from "../components/instanceTable.svelte";
    import { openDeleteConfirmModal } from "../stores/storeModal";


    let deleteModal : ConfirmDeleteModal;

</script>

<div class="mt-2.5 ml-1.5">
  <InstanceTable />
</div>

{#if $openDeleteConfirmModal}
  <ConfirmDeleteModal bind:this={deleteModal} />
{/if}