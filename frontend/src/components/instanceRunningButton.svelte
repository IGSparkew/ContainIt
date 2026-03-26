<script lang="ts">
    import { Pause, Play } from "lucide-svelte";
    import type { InstanceStatus } from "../types/instance";
    import { instanceStore } from "../stores/store";


    type Props = {
        id: string
        status: InstanceStatus
    }

    const {id, status} : Props = $props();
</script>


{#if status == 'stopped'}
    <button class="hover:cursor-pointer" type="button" onclick={() => instanceStore.startInstance(id)}><Play /></button>
{:else if status == 'running'}
    <button class="hover:cursor-pointer" type="button" onclick={() => instanceStore.stopInstance(id)}><Pause /></button>
{:else}    
  <div>error</div>  
{/if}