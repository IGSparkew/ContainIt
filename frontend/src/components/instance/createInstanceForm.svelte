<script lang="ts">
  import type { Volume } from "../../types/volume";
  import { mongo_port_default, mysql_port_default, postegres_port_default, redis_port_default } from "../../types/defaultFromValue";
  import type { InstanceForm } from "../../types/instance";
  import { isAdminType } from "../../types/instance";
  import { volumeStore } from "../../stores/volumeStore";
  import { networkStore } from "../../stores/networkStore";

  const NAME_REGEX = /^[a-zA-Z0-9\-_]+$/;

  let { onsubmit, oncancel }: {
    onsubmit: (form: InstanceForm) => Promise<void>;
    oncancel: () => void;
  } = $props();

  function getDefaultForm(): InstanceForm {
    return { name: '', type: undefined, port: undefined, password: '', volumeId: undefined, networkId: undefined };
  }

  let form = $state<InstanceForm>(getDefaultForm());
  let submitted = $state(false);

  const isAdmin = $derived(form.type !== undefined && isAdminType(form.type));

  const nameError = $derived((() => {
    if (!submitted && !form.name) return '';
    if (!form.name || form.name.trim() === '') return 'Le nom est requis';
    if (!NAME_REGEX.test(form.name)) return "Uniquement lettres, chiffres, tirets et underscores (pas d'espaces)";
    if (form.name.length < 2 || form.name.length > 32) return 'Entre 2 et 32 caractères';
    return '';
  })());

  const typeError = $derived(submitted && !form.type ? 'Le type est requis' : '');

  const portError = $derived((() => {
    if (isAdmin) return '';
    if (!submitted && !form.port) return '';
    if (!form.port) return 'Le port est requis';
    if (form.port < 1024 || form.port > 65535) return 'Le port doit être entre 1024 et 65535';
    return '';
  })());

  const passwordError = $derived((() => {
    if (isAdmin) return '';
    if (!submitted && !form.password) return '';
    if (!form.password || form.password.trim() === '') return 'Le mot de passe est requis';
    if (form.password.length < 6) return '6 caractères minimum';
    return '';
  })());

  const networkError = $derived((() => {
    if (!isAdmin) return '';
    if (!submitted && !form.networkId) return '';
    if (!form.networkId) return 'Le réseau est requis';
    return '';
  })());

  const isFormValid = $derived(
    !nameError && !typeError && !!form.name && !!form.type &&
    (isAdmin
      ? !!form.networkId
      : (!portError && !passwordError && !!form.port && !!form.password))
  );

  const orphanVolumes: Volume[] = $derived(
    $volumeStore.filter(v => form.type != undefined && v.type == form.type)
  );

  function changeTypeInstance() {
    if (form.type !== undefined && isAdminType(form.type)) {
      form.port = undefined;
      form.password = undefined;
      return;
    }
    if (form.port !== undefined && form.port > 0) return;
    switch (form.type) {
      case 'postgres': form.port = postegres_port_default; break;
      case 'mysql':    form.port = mysql_port_default;     break;
      case 'mongo':    form.port = mongo_port_default;     break;
      case 'redis':    form.port = redis_port_default;     break;
    }
  }

  export function reset() {
    form = getDefaultForm();
    submitted = false;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    submitted = true;
    if (!isFormValid) return;
    await onsubmit(form);
    reset();
  }
</script>

<form class="fieldset" onsubmit={handleSubmit}>
  <div class="form-control">
    <input
      class="input {nameError ? 'input-error' : ''}"
      type="text"
      bind:value={form.name}
      placeholder="Nom de l'instance"
    />
    {#if nameError}<span class="text-error text-sm mt-1">{nameError}</span>{/if}
  </div>

  <div class="form-control">
    <select
      class="select {typeError ? 'select-error' : ''}"
      bind:value={form.type}
      onchange={changeTypeInstance}
    >
      <option value={undefined} disabled selected>Choisir le type d'instance</option>
      <optgroup label="Bases de données">
        <option value="postgres">PostgreSQL</option>
        <option value="mysql">MySQL</option>
        <option value="mongo">MongoDB</option>
        <option value="redis">Redis</option>
      </optgroup>
      <optgroup label="Outils d'administration">
        <option value="adminer">Adminer</option>
        <option value="mongo-express">Mongo Express</option>
        <option value="redisinsight">RedisInsight</option>
      </optgroup>
    </select>
    {#if typeError}<span class="text-error text-sm mt-1">{typeError}</span>{/if}
  </div>

  {#if isAdmin}
    <div class="form-control">
      <select
        class="select {networkError ? 'select-error' : ''}"
        bind:value={form.networkId}
      >
        <option value={undefined} disabled selected>Choisir le réseau</option>
        {#each $networkStore as network (network.id)}
          <option value={network.id}>{network.name}</option>
        {/each}
      </select>
      {#if networkError}<span class="text-error text-sm mt-1">{networkError}</span>{/if}
    </div>
  {:else}
    <div class="form-control">
      <input
        class="input {portError ? 'input-error' : ''}"
        type="number"
        min="1024"
        max="65535"
        bind:value={form.port}
        placeholder="Port de l'instance"
      />
      {#if portError}<span class="text-error text-sm mt-1">{portError}</span>{/if}
    </div>

    <div class="form-control">
      <input
        class="input {passwordError ? 'input-error' : ''}"
        type="password"
        bind:value={form.password}
        placeholder="Mot de passe (6 caractères min.)"
      />
      {#if passwordError}<span class="text-error text-sm mt-1">{passwordError}</span>{/if}
    </div>

    {#if orphanVolumes.length > 0}
      <div class="form-control">
        <select class="select" bind:value={form.volumeId}>
          <option value={undefined} disabled selected>Choisir un volume (optionnel)</option>
          {#each orphanVolumes as orphanVolume (orphanVolume.id)}
            <option value={orphanVolume.id}>{orphanVolume.name}</option>
          {/each}
        </select>
      </div>
    {/if}
  {/if}

  <div class="flex gap-2 justify-end">
    <button class="btn" type="button" onclick={oncancel}>Annuler</button>
    <button class="btn btn-primary" type="submit">Créer l'instance</button>
  </div>
</form>
