import { Manga, Chapter, Page, MangaStatus, ReadingProgress } from '../types';
import * as DB from './db';

// Admin Functions
export const createManga = async (
  title: string,
  description: string,
  coverFile: File,
  author: string,
  status: MangaStatus
): Promise<Manga> => {
  const coverBase64 = await DB.fileToBase64(coverFile);
  const newManga: Manga = {
    id: DB.generateId(),
    title,
    description,
    coverImage: coverBase64,
    author,
    status,
    createdAt: Date.now(),
  };
  await DB.addManga(newManga);
  return newManga;
};

export const uploadChapterImages = async (
  mangaId: string,
  chapterNumber: number,
  title: string,
  files: File[]
): Promise<Chapter> => {
  const chapterId = DB.generateId();
  
  // Smart sorting: try to detect numbers in filenames
  const sortedFiles = Array.from(files).sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
    return numA - numB;
  });

  const pages: Page[] = [];
  
  // Process files in parallel but limit concurrency in a real app. 
  // Here we do it sequentially to ensure order and prevent memory spikes in the demo.
  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    // Smart Handling: Skip small files (e.g. < 5KB icons)
    if (file.size < 5000) continue;

    const base64 = await DB.fileToBase64(file);
    pages.push({
      id: DB.generateId(),
      chapterId,
      pageNumber: i + 1,
      data: base64
    });
  }

  const newChapter: Chapter = {
    id: chapterId,
    mangaId,
    title,
    number: chapterNumber,
    createdAt: Date.now(),
    pageCount: pages.length,
    isPdf: false
  };

  await DB.addChapter(newChapter);
  await DB.addPages(pages);
  
  return newChapter;
};

export const uploadChapterPdf = async (
  mangaId: string,
  chapterNumber: number,
  title: string,
  pdfFile: File
): Promise<Chapter> => {
  const chapterId = DB.generateId();
  const pdfData = await DB.fileToBase64(pdfFile);

  const newChapter: Chapter = {
    id: chapterId,
    mangaId,
    title,
    number: chapterNumber,
    createdAt: Date.now(),
    pageCount: 0, // 0 indicates PDF mode where page count is dynamic or unknown
    isPdf: true,
    pdfData
  };

  await DB.addChapter(newChapter);
  return newChapter;
};

// User Functions
export const getMangaCatalog = async () => {
  return await DB.getAllManga();
};

export const getMangaDetails = async (id: string) => {
  const manga = await DB.getMangaById(id);
  const chapters = await DB.getChaptersByMangaId(id);
  return { manga, chapters };
};

export const getChapterReaderData = async (chapterId: string) => {
  const chapter = await DB.getChapterById(chapterId);
  if (!chapter) throw new Error("Chapter not found");

  if (chapter.isPdf) {
    return { chapter, pages: [] };
  }

  const pages = await DB.getPagesByChapterId(chapterId);
  return { chapter, pages };
};

// Progress Functions
export const saveReadingProgress = async (userId: string, mangaId: string, chapterId: string, lastPage: number) => {
  const progress: ReadingProgress = {
    id: `${userId}_${chapterId}`,
    userId,
    mangaId,
    chapterId,
    lastPage,
    updatedAt: Date.now()
  };
  await DB.saveProgress(progress);
};

export const getReadingProgress = async (userId: string, chapterId: string) => {
  return await DB.getProgress(userId, chapterId);
};

export const getAllMangaProgress = async (userId: string, mangaId: string) => {
  return await DB.getUserMangaProgress(userId, mangaId);
};