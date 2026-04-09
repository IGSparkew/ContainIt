<script lang="ts">
    import type { InstanceStatus } from "../../types/instance";

    type Props = {
        status: InstanceStatus
    }

    const {status} : Props = $props();
</script>


{#if status == 'running'}
    <div class="badge badge-sm badge-success justify-self-end">{status}</div>
{:else if status == 'stopped'}
    <div class="badge badge-sm badge-error justify-self-end">{status}</div>
{:else}
    <div class="badge badge-sm badge-warning justify-self-end">{status}</div>
{/if}
