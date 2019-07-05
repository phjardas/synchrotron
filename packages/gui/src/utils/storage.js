export function createStorage(key) {
  return {
    get(defaultValue) {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    },
    set(value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
  };
}
