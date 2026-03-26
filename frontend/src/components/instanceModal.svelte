<script lang="ts">
  import { instanceStore } from "../stores/store";
  import { openModal } from "../stores/storeModal";
    import { mongo_port_default, mysql_port_default, postegres_port_default, redis_port_default } from "../types/defaultFromValue";
  import type { InstanceForm } from "../types/instance";
  
  let modal: HTMLDialogElement;

  let isClosing = false

  function getDefaultForm(): InstanceForm {
    return {
      name: '',
      type: undefined,
      port: undefined,
      password: ''
    }
  }


  $effect(() => {
    if ($openModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  })

  let form = $state<InstanceForm>(getDefaultForm());

  async function createInstanceFormPost(e: Event) {
    e.preventDefault();
    if (form.name && form.name !== "" && form.password && form.password !== "" && form.port && form.port > 1025 && form.port < 65535) {
      await instanceStore.addInstance(form);
      closeModal();      
    }
  }

  function closeModal() {
    if (isClosing) return;
    isClosing = true;
    form = getDefaultForm();
    openModal.set(false);
    modal.close();
    isClosing = false;
  }

  async function changeTypeInstance() {
    if (form.port !== undefined && form.port > 0) return;
    switch (form.type) {
      case 'postgres':
        form.port = postegres_port_default;
        break;
      case 'mysql':
        form.port = mysql_port_default;
        break;
      case 'mongo':
        form.port = mongo_port_default;
        break;
      case 'redis':
        form.port = redis_port_default;
        break;
    }
    
  }

  $inspect(form);
</script>

<dialog bind:this={modal} class="modal" onclose={closeModal}>
  <div class="modal-box">
    <form class="fieldset" onsubmit={createInstanceFormPost}>
        <input class="input" type="text" bind:value={form.name} placeholder="Name of instance"/>
        <select class="select" bind:value={form.type} onchange={changeTypeInstance} placeholder="Type of instance">
          <option value={undefined} disabled selected>Choose type of instance</option>
          <option value="postgres">PostegresSQl</option>
          <option value="mysql">Mysql</option>
          <option value="mongo">Mongo</option>
          <option value="redis">Redis</option>
        </select>
        <input class="input" type="number" min="1024"max="65535" bind:value={form.port} placeholder="Port of instance"/>
        <input class="input" type="password" bind:value={form.password} placeholder="Password of instance"/>
        <button class="btn btn-primary" type="submit">Create Instance</button>
    </form>
  </div>
</dialog>