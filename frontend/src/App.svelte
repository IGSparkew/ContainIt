<script lang="ts">
    import { Plus } from "lucide-svelte";
    import InstanceModal from "./components/instanceModal.svelte";
    import { openModal } from "./stores/storeModal";
    import InstanceTable from "./components/instanceTable.svelte";

    let instanceModal : InstanceModal;
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
    <button class="btn btn-square btn-ghost" onclick={() => openModal.set(true)}>
      <Plus />
    </button>
  </div>
</div>
<div class="mt-2.5 ml-1.5">
  <InstanceTable />
</div>
{#if $openModal}
  <InstanceModal bind:this={instanceModal} />
{/if}