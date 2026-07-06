export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('flowsign_db', 1)

    request.onerror = () => reject(request.error)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('keyval')) {
        db.createObjectStore('keyval')
      }
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction('keyval', 'readonly')
      const store = transaction.objectStore('keyval')
      const getRequest = store.get(key)

      getRequest.onsuccess = () => resolve(getRequest.result ?? null)
      getRequest.onerror = () => reject(getRequest.error)
    }
  })
}

export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('flowsign_db', 1)

    request.onerror = () => reject(request.error)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('keyval')) {
        db.createObjectStore('keyval')
      }
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction('keyval', 'readwrite')
      const store = transaction.objectStore('keyval')
      const putRequest = store.put(value, key)

      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    }
  })
}

export const removeStorageItem = async (key: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('flowsign_db', 1)

    request.onerror = () => reject(request.error)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('keyval')) {
        db.createObjectStore('keyval')
      }
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction('keyval', 'readwrite')
      const store = transaction.objectStore('keyval')
      const deleteRequest = store.delete(key)

      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}
