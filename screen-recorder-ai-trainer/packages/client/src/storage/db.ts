import { Recording } from '@shared/types/recording';

const DB_NAME = 'screen-recorder-ai-trainer';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'recordings';
const VIDEOS_STORE = 'videos';

interface VideoEntry {
  id: string;
  blob: Blob;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
        const store = db.createObjectStore(RECORDINGS_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
        db.createObjectStore(VIDEOS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecording(recording: Recording, videoBlob?: Blob): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([RECORDINGS_STORE, VIDEOS_STORE], 'readwrite');

  tx.objectStore(RECORDINGS_STORE).put(recording);
  if (videoBlob) {
    tx.objectStore(VIDEOS_STORE).put({ id: recording.id, blob: videoBlob });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  const db = await openDB();
  const tx = db.transaction(RECORDINGS_STORE, 'readonly');
  const request = tx.objectStore(RECORDINGS_STORE).get(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecordings(): Promise<Recording[]> {
  const db = await openDB();
  const tx = db.transaction(RECORDINGS_STORE, 'readonly');
  const request = tx.objectStore(RECORDINGS_STORE).index('createdAt').getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve((request.result as Recording[]).reverse());
    request.onerror = () => reject(request.error);
  });
}

export async function getVideoBlob(id: string): Promise<Blob | undefined> {
  const db = await openDB();
  const tx = db.transaction(VIDEOS_STORE, 'readonly');
  const request = tx.objectStore(VIDEOS_STORE).get(id);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const entry = request.result as VideoEntry | undefined;
      resolve(entry?.blob);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([RECORDINGS_STORE, VIDEOS_STORE], 'readwrite');
  tx.objectStore(RECORDINGS_STORE).delete(id);
  tx.objectStore(VIDEOS_STORE).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateRecording(recording: Recording): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
  tx.objectStore(RECORDINGS_STORE).put(recording);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
