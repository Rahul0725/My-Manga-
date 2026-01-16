import { Manga, Chapter, Page, User, ReadingProgress } from '../types';

const DB_NAME = 'MyMangaDB';
const DB_VERSION = 2; // Incremented version for new stores

let dbPromise: Promise<IDBDatabase> | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('manga')) {
        db.createObjectStore('manga', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chapters')) {
        const store = db.createObjectStore('chapters', { keyPath: 'id' });
        store.createIndex('mangaId', 'mangaId', { unique: false });
      }
      if (!db.objectStoreNames.contains('pages')) {
        const store = db.createObjectStore('pages', { keyPath: 'id' });
        store.createIndex('chapterId', 'chapterId', { unique: false });
        store.createIndex('chapterId_pageNumber', ['chapterId', 'pageNumber'], { unique: true });
      }
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', { keyPath: 'id' });
        store.createIndex('email', 'email', { unique: true });
      }
      if (!db.objectStoreNames.contains('progress')) {
        const store = db.createObjectStore('progress', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('userId_mangaId', ['userId', 'mangaId'], { unique: false });
      }
    };
  });

  return dbPromise;
};

// Generic Helper
const performTransaction = <T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest | void
): Promise<T> => {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      transaction.oncomplete = () => {
        if (request instanceof IDBRequest) {
          resolve(request.result);
        } else {
          resolve(undefined as T);
        }
      };
      transaction.onerror = () => reject(transaction.error);
    });
  });
};

// Manga Operations
export const addManga = (manga: Manga) => performTransaction('manga', 'readwrite', (store) => store.put(manga));
export const getAllManga = () => performTransaction<Manga[]>('manga', 'readonly', (store) => store.getAll());
export const getMangaById = (id: string) => performTransaction<Manga>('manga', 'readonly', (store) => store.get(id));

// Chapter Operations
export const addChapter = (chapter: Chapter) => performTransaction('chapters', 'readwrite', (store) => store.put(chapter));
export const getChaptersByMangaId = async (mangaId: string): Promise<Chapter[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chapters', 'readonly');
    const index = tx.objectStore('chapters').index('mangaId');
    const request = index.getAll(IDBKeyRange.only(mangaId));
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.number - a.number));
    request.onerror = () => reject(request.error);
  });
};
export const getChapterById = (id: string) => performTransaction<Chapter>('chapters', 'readonly', (store) => store.get(id));

// Page Operations
export const addPages = async (pages: Page[]) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('pages', 'readwrite');
    const store = tx.objectStore('pages');
    pages.forEach(page => store.put(page));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getPagesByChapterId = async (chapterId: string): Promise<Page[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pages', 'readonly');
    const index = tx.objectStore('pages').index('chapterId');
    const request = index.getAll(IDBKeyRange.only(chapterId));
    request.onsuccess = () => {
      const pages = request.result as Page[];
      resolve(pages.sort((a, b) => a.pageNumber - b.pageNumber));
    };
    request.onerror = () => reject(request.error);
  });
};

// User Operations
export const addUser = (user: User) => performTransaction('users', 'readwrite', (store) => store.put(user));
export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const index = tx.objectStore('users').index('email');
    const request = index.get(email);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Progress Operations
export const saveProgress = (progress: ReadingProgress) => performTransaction('progress', 'readwrite', (store) => store.put(progress));
export const getProgress = (userId: string, chapterId: string) => 
  performTransaction<ReadingProgress>('progress', 'readonly', (store) => store.get(`${userId}_${chapterId}`));
export const getUserMangaProgress = async (userId: string, mangaId: string): Promise<ReadingProgress[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('progress', 'readonly');
    const index = tx.objectStore('progress').index('userId_mangaId');
    const request = index.getAll(IDBKeyRange.only([userId, mangaId]));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Utils
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);