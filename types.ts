export enum MangaStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  HIATUS = 'Hiatus'
}

export interface Manga {
  id: string;
  title: string;
  description: string;
  coverImage: string; // Base64 or URL
  author?: string;
  status: MangaStatus;
  createdAt: number;
}

export interface Chapter {
  id: string;
  mangaId: string;
  title: string;
  number: number;
  createdAt: number;
  pageCount: number;
  isPdf: boolean;
  pdfData?: string; // Base64 data for PDF mode
}

export interface Page {
  id: string;
  chapterId: string;
  pageNumber: number;
  data: string; // Base64 image data
}

export interface StorageStats {
  mangaCount: number;
  chapterCount: number;
  storageUsed: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // In a real app, never store plain text, here we simulate a hash
  isAdmin: boolean;
}

export interface ReadingProgress {
  id: string; // composite key: userId_chapterId
  userId: string;
  mangaId: string;
  chapterId: string;
  lastPage: number;
  updatedAt: number;
}