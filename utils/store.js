

const store = {};

export function storeFile(id, data) {
  store[id] = data;
}

export function getFile(id) {
  return store[id] || null;
}
