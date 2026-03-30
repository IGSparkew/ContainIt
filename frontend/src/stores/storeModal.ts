import { writable } from 'svelte/store';
export const openCreationFormModal = writable<boolean>(false);

export const openDeleteConfirmModal = writable<boolean>(false);