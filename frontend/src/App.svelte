<script lang="ts">
    import { Network, Plus } from "lucide-svelte";
    import InstanceModal from "./components/instanceModal.svelte";
    import { openCreationFormModal, openCreationNetworkFormModal, openDeleteConfirmModal } from "./stores/storeModal";
    import InstanceTable from "./components/instanceTable.svelte";
    import ConfirmDeleteModal from "./components/ConfirmDeleteModal.svelte";
    import NetworkModal from "./components/network/networkModal.svelte";

    let instanceModal : InstanceModal;
    let deleteModal : ConfirmDeleteModal;
    let networkModal : NetworkModal;
</script>

<div class="navbar bg-base-100 shadow-sm">
 <div class="flex-none">
    <button class="btn btn-square btn-ghost">
      <img src="/containitLogo.png" alt="ContainIt logo" />
    </button>
  </div>
  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/">ContainIt</a>
  </div>
  <div class="flex-none">
    <button class="btn btn-square btn-ghost" onclick={() => openCreationNetworkFormModal.set(true)}>
      <Network />
    </button>
    <button class="btn btn-square btn-ghost" onclick={() => openCreationFormModal.set(true)}>
      <Plus />
    </button>
  </div>
</div>
<div class="mt-2.5 ml-1.5">
  <InstanceTable />
</div>
{#if $openCreationFormModal}
  <InstanceModal bind:this={instanceModal} />
{/if}

{#if $openDeleteConfirmModal}
  <ConfirmDeleteModal bind:this={deleteModal} />
{/if}

{#if $openCreationNetworkFormModal}
  <NetworkModal bind:this={networkModal}/>
{/if}