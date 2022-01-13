import { writable } from 'svelte/store';

export const showCustomer = writable(true);

export const selectedIds = writable([]);
export const selectedListSize = writable(0);