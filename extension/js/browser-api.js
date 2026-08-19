window.browserAPI = (function () {
  const api = typeof browser !== 'undefined' ? browser : chrome;

  function getStorage() {
    return api.storage && api.storage.local ? api.storage.local : null;
  }

  async function storageGet(keys) {
    const storage = getStorage();
    if (!storage) return {};
    return new Promise((resolve) => {
      storage.get(keys, (result) => {
        if (api.runtime && api.runtime.lastError) {
          resolve({});
        } else {
          resolve(result || {});
        }
      });
    });
  }

  async function storageSet(items) {
    const storage = getStorage();
    if (!storage) return;
    return new Promise((resolve) => {
      storage.set(items, () => {
        if (api.runtime && api.runtime.lastError) {
          console.warn('Storage write failed:', api.runtime.lastError.message);
        }
        resolve();
      });
    });
  }

  async function storageRemove(keys) {
    const storage = getStorage();
    if (!storage) return;
    return new Promise((resolve) => {
      storage.remove(keys, () => {
        resolve();
      });
    });
  }

  return {
    storage: {
      get: storageGet,
      set: storageSet,
      remove: storageRemove
    }
  };
})();
