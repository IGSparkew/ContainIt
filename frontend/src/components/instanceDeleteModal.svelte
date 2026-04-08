<script lang="ts">
    import { instanceStore } from "../stores/instanceStore";
    import { openDeleteConfirmModal } from "../stores/storeModal";

    let keepvolumes = $state<boolean>(true);
    
    const {instancesIdToDelete, error} = instanceStore;    

    let modal: HTMLDialogElement;

    function confirmDeleteInstance() {
        if ($instancesIdToDelete.length > 0) {
            $instancesIdToDelete.forEach(i => {
                instanceStore.deleteInstance(i, keepvolumes);
            });
        } else {
            error.set("No instance(s) selected to delete");
        }

        resetModal();
    }

    function resetModal() {
        instancesIdToDelete.set([]);
        openDeleteConfirmModal.set(false);
        keepvolumes = false;
    }

    $effect(() => {
    if ($openDeleteConfirmModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  })

</script>


<dialog bind:this={modal} class="modal" onclose={resetModal}>
  <div class="modal-box">
    <form class="fieldset flex flex-col gap-3" onsubmit={confirmDeleteInstance}>
        <section class="flex flex-row justify-center gap-1">
            <button class="btn btn-error flex-auto" type="submit">Delete</button>
            <button class="btn btn-primary flex-auto" type="button" onclick={resetModal}>Close</button>
        </section>
        <section class="flex flex-row gap-1 items-center justify-center">
            <input type="checkbox" bind:checked={keepvolumes} class="toggle"/>
            <h6>keep the volume of the instance</h6>
        </section>
    </form>
  </div>
</dialog>