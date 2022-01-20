import { writable } from 'svelte/store';
import { createFieldValidator } from '../components/validation'
import { emailValidator, requiredValidator } from '../components/validators'

export const showCustomer = writable(true);

export const selectedIds = writable([]);
export const selectedListSize = writable(0);

export const [ validity, validate ] = createFieldValidator(requiredValidator(), emailValidator())