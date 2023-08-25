const KEY = "contacts";


interface ContactList {
    created_at: string;
    first_name: string;
    id: number;
    last_name: string;
    phones: { number: string }[];
    favorite: boolean;
  } 

// get contacts from local storage and parse to object
function safeGet(): Record<string, ContactList> {
  const value = localStorage.getItem(KEY);
  // if nothing in storage, return an empty object
  if (!value) {
    return {};
  }
  return JSON.parse(value);
}

// stringify and save contacts on local storage
function save(contacts: Record<string, ContactList>): void {
  localStorage.setItem(KEY, JSON.stringify(contacts));
}

// get contacts as a list
export function getContacts(): ContactList[] {
  return Object.values(safeGet());
}

export function getContactBySlug(slug: string): ContactList | undefined {
  return safeGet()[slug];
}

// update or insert contact
export function upsertContact(contact: ContactList): void {
  const data = safeGet();
  data[contact.id] = contact;
  save(data);
}

export function deleteContactBySlug(id: number): void {
  const data = safeGet();
  delete data[id];
  save(data);
}
