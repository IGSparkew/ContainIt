<script lang="ts">
    import { networkStore } from "../../stores/networkStore";
    import { openCreationNetworkFormModal } from "../../stores/storeModal";
    import type { NetworkForm } from "../../types/network";

    let modal: HTMLDialogElement;
    let isClosing = false;

    function getDefaultForm() : NetworkForm {
        return {
            name: undefined,
            driver: undefined
        }
    }
    
    async function createNetwork() {
        
        if (form.name != undefined && form.driver != undefined) {

            await networkStore.createNetwork(form);
            resetModal();
        }
    }
    
    function resetModal() {
        if (isClosing) return;
        isClosing = true;
        form = getDefaultForm();
        openCreationNetworkFormModal.set(false);
        modal.close();
        isClosing = false;    
    }

    let form = $state<NetworkForm>(getDefaultForm());

    $effect(() => {
    if ($openCreationNetworkFormModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  })

</script>


<dialog bind:this={modal} class="modal" onclose={resetModal}>
  <div class="modal-box">
    <form class="fieldset flex flex-col gap-3" onsubmit={createNetwork}>
        <input class="input" type="text" bind:value={form.name} placeholder="Name of the network"/>
        <select class="select" bind:value={form.driver} placeholder="Type of network">
          <option value={undefined} disabled selected>Choose type of driver network</option>
          <option value="bridge">Bridge</option>
          <option value="overlay">Overlay</option>
        </select>
        <button class="btn btn-primary" type="submit">Create Network</button>    
    </form>
  </div>
</dialog>