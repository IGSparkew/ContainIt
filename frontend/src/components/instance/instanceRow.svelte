<script lang="ts">
    import type { Instance } from "../../types/instance";
    import InstanceRunningButton from "./instanceRunningButton.svelte";
    import InstanceStatus from "./instanceStatus.svelte";
    import { networkStore } from "../../stores/networkStore";

    type Props =  {
        instance: Instance;
        toggleSelection: (id: string) => void;
        selectedRows: string[]
    }

    const {instance, selectedRows, toggleSelection} : Props = $props();

    const instanceNetworks = $derived(
        $networkStore.filter(n => n.instance.includes(instance.id))
    )

    async function detach(networkId: string) {
        await networkStore.detachContainer(networkId, instance.id)
    }
</script>

<tr class="{selectedRows.includes(instance.id) ? 'bg-base-200' : ''}">
       <td>
        <label>
            <input type="checkbox" class="checkbox" onclick={() => toggleSelection(instance.id)} checked={selectedRows.includes(instance.id)} />
        </label>
       </td>
        <td>{instance.name}</td>
        <td>{instance.type}</td>
        <td>{instance.port}</td>
        <td>
            <InstanceStatus status={instance.status} />
        </td>
        <td>
            <div class="flex flex-wrap gap-1">
                {#each instanceNetworks as network (network.id)}
                    <div class="flex items-center gap-1">
                        <span class="badge badge-outline badge-sm">{network.name}</span>
                        <button class="btn btn-xs btn-warning" onclick={() => detach(network.id)}>Detach</button>
                    </div>
                {/each}
            </div>
        </td>
        <td class="hover:cursor-pointer">
            <InstanceRunningButton id={instance.id} status={instance.status} />
        </td>
</tr>
