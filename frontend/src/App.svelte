<script lang="ts">
    import { Network, Plus, Route } from "lucide-svelte";
    import { openCreationFormModal, openCreationNetworkFormModal } from "./stores/storeModal";
    import Instances from "./pages/Instances.svelte";
    import Networking from "./pages/Networking.svelte";
    import Router from "svelte-spa-router";
    import InstanceModal from "./components/instance/modal/instanceModal.svelte";
    import NetworkModal from "./components/network/networkModal.svelte";

    const routes = { '/': Instances, '/networking': Networking }
    
    let instanceModal : InstanceModal;
    let networkModal : NetworkModal;
</script>

<div class="navbar bg-base-100 shadow-sm">
 <div class="flex-none">
    <button class="btn btn-square btn-ghost">
      <img src="/containitLogo.png" alt="ContainIt logo" />
    </button>
  </div>
  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="#/">ContainIt</a>
    <a class="btn btn-ghost text-xl" href="#/">Instances</a>
    <a class="btn btn-ghost text-xl" href="#/networking">Networking</a>
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

<Router routes={routes} />

{#if $openCreationFormModal}
  <InstanceModal bind:this={instanceModal} />
{/if}

{#if $openCreationNetworkFormModal}
  <NetworkModal bind:this={networkModal}/>
{/if}
