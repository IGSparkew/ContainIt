<script lang="ts">
    import type { Instance } from "../types/instance";
    import InstanceRunningButton from "./instanceRunningButton.svelte";
    import InstanceStatus from "./instanceStatus.svelte";

    type Props =  {
        instance: Instance;
        toggleSelection: (id: string) => void;
        selectedRows: string[]
    }

    const {instance, selectedRows, toggleSelection} : Props = $props();
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
        <td class="hover:cursor-pointer">
            <InstanceRunningButton id={instance.id} status={instance.status} />
        </td>
</tr>