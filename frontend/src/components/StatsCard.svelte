<script lang="ts">
    import { Cpu, MemoryStick } from "lucide-svelte";
    import type { IconTypeStat } from "../types/iconType";

    type Props = {
        name: string,
        iconType: IconTypeStat,
        value: number
    }

    const {name , iconType, value} : Props = $props();
</script>

<div class="stats shadow">
  <div class="stat">
    <div class="stat-figure text-primary">
      {#if iconType == 'cpu'}
      <Cpu />
      {:else if iconType == 'ram'}
      <MemoryStick />
      {/if}
    </div>
    <div class="stat-title">{name}</div>
    <div class="stat-value text-primary">{value} %</div>
</div>
</div>