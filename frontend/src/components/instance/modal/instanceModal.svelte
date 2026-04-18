<script lang="ts">
  import { instanceStore } from "../../../stores/instanceStore";
  import { openCreationFormModal } from "../../../stores/storeModal";
  import type { InstanceForm } from "../../../types/instance";
  import { volumeStore } from "../../../stores/volumeStore";
  import CreateInstanceForm from "../createInstanceForm.svelte";

  let modal: HTMLDialogElement;
  let isClosing = false;

  $effect(() => {
    if ($openCreationFormModal) {
      volumeStore.fetchOrphanVolumes();
      modal.showModal();
    } else {
      modal.close();
    }
  });

  function closeModal() {
    if (isClosing) return;
    isClosing = true;
    openCreationFormModal.set(false);
    modal.close();
    isClosing = false;
  }

  async function handleCreate(form: InstanceForm) {
    await instanceStore.addInstance(form);
    closeModal();
  }
</script>

<dialog bind:this={modal} class="modal" onclose={closeModal}>
  <div class="modal-box">
    <CreateInstanceForm onsubmit={handleCreate} oncancel={closeModal} />
  </div>
</dialog>
