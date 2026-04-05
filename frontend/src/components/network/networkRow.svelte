<script lang="ts">
    import type { Network } from "../../types/network";

    type Props =  {
        network: Network;
        toggleSelection: (id: string) => void;
        selectedRows: string[]
    }

    const {network, selectedRows, toggleSelection} : Props = $props();
</script>

<tr class="{selectedRows.includes(network.id) ? 'bg-base-200' : ''}">
       <td>
        <label>
            <input type="checkbox" class="checkbox" onclick={() => toggleSelection(network.id)} checked={selectedRows.includes(network.id)} />
        </label>  
       </td>
        <td>{network.name}</td>
        <td>{network.driver}</td>
        <td>
            {#if network.instance.length == 0}
                <div class="inline-grid *:[grid-area:1/1]">
                <div class="status status-error animate-ping"></div>
                <div class="status status-error"></div>
                </div> Network with no instance
            {:else}
                <div class="inline-grid *:[grid-area:1/1]">
                <div class="status status-success animate-ping"></div>
                <div class="status status-success"></div>
                </div>
            {/if}
        </td>
        <td>{network.createdAt}</td>
</tr>