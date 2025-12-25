export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("EclipseStorage", 2);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("videos")) {
                db.createObjectStore("videos");
            }
            if (!db.objectStoreNames.contains("posts")) {
                db.createObjectStore("posts");
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const storePostFile = async (id: string, file: File): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("posts", "readwrite");
        const store = transaction.objectStore("posts");
        const request = store.put(file, id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getPostFile = async (id: string): Promise<File | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("posts", "readonly");
        const store = transaction.objectStore("posts");
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};

export const storeVideoFile = async (id: string, file: File): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("videos", "readwrite");
        const store = transaction.objectStore("videos");
        const request = store.put(file, id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getVideoFile = async (id: string): Promise<File | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("videos", "readonly");
        const store = transaction.objectStore("videos");
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
};
export const deleteVideoFile = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("videos", "readwrite");
        const store = transaction.objectStore("videos");
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
export const clearAllVideos = async (): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("videos", "readwrite");
        const store = transaction.objectStore("videos");
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const deletePostFile = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction("posts", "readwrite");
        const store = transaction.objectStore("posts");
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
