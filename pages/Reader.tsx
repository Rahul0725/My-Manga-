import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Image as ImageIcon, FileText, Settings, X } from 'lucide-react';
import { getChapterReaderData, saveReadingProgress, getReadingProgress } from '../services/mangaService';
import { Chapter, Page, Manga } from '../types';
import { getMangaById } from '../services/db';
import { downloadImage, downloadChapterZip, downloadChapterPdf, downloadRawPdf } from '../utils/downloader';
import { useAuth } from '../context/AuthContext';

export const Reader: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [manga, setManga] = useState<Manga | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load Data
  useEffect(() => {
    if (chapterId) {
      setLoading(true);
      getChapterReaderData(chapterId)
        .then(async ({ chapter, pages }) => {
          setChapter(chapter);
          setPages(pages);
          const m = await getMangaById(chapter.mangaId);
          if (m) setManga(m);
          
          // Restore progress if user is logged in
          if (user && !chapter.isPdf) {
            const progress = await getReadingProgress(user.id, chapter.id);
            if (progress && progress.lastPage > 1 && containerRef.current) {
              // Wait for render cycle
              setTimeout(() => {
                const targetPage = pageRefs.current[progress.lastPage - 1];
                if (targetPage) targetPage.scrollIntoView();
              }, 100);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [chapterId, user]);

  // Scroll Progress Bar
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setReadProgress(progress);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, [loading]);

  // Track Visible Page for Progress
  useEffect(() => {
    if (!user || loading || !pages.length || !chapter || !manga) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(entry.target.getAttribute('data-index') || '0');
            saveReadingProgress(user.id, manga.id, chapter.id, pageIndex + 1);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5 // Trigger when 50% of page is visible
      }
    );

    pageRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, pages, user, chapter, manga]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Loading Chapter...</div>;
  if (!chapter || !manga) return <div className="h-screen flex items-center justify-center bg-black text-white">Error loading content</div>;

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden relative">
      
      {/* Top Bar (Sticky/Floating) */}
      <div className={`absolute top-0 left-0 right-0 z-50 transition-transform duration-300 ${showMenu ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="bg-slate-900/90 backdrop-blur text-white p-3 flex justify-between items-center shadow-lg">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-blue-400">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium truncate max-w-[150px]">{manga.title}</span>
          </button>
          <div className="text-sm font-bold text-blue-400">Ch. {chapter.number}</div>
          <button onClick={() => setShowMenu(false)} className="p-1"><X size={20} /></button>
        </div>
      </div>

      {/* Reader Area */}
      <div 
        ref={containerRef}
        onClick={() => setShowMenu(!showMenu)}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <div className="max-w-3xl mx-auto min-h-screen bg-black relative">
          {chapter.isPdf ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center gap-4">
              <div className="bg-slate-800 p-6 rounded-xl">
                <FileText size={64} className="mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-bold mb-2">PDF Chapter</h3>
                <p className="text-slate-400 mb-6">This chapter is in PDF format.</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadRawPdf(chapter); }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto"
                >
                  <Download size={20} /> Download PDF to Read
                </button>
              </div>
            </div>
          ) : (
            <>
              {pages.map((page, index) => (
                <div 
                  key={page.id} 
                  ref={(el) => { pageRefs.current[index] = el; }}
                  data-index={index}
                  className="relative w-full"
                >
                   <img 
                    src={page.data} 
                    alt={`Page ${page.pageNumber}`} 
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                  {/* Page Divider / Number (optional, kept subtle) */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-50">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {/* End of Chapter Action */}
              <div className="p-8 text-center space-y-4 pb-20">
                <p className="text-slate-500">You've reached the end of Chapter {chapter.number}</p>
                <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">
                  Return to Chapter List
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Progress/Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 pointer-events-none flex justify-center ${showMenu ? 'opacity-100' : 'opacity-0'}`}>
         {/* Download Options - visible when menu is active */}
         <div className="pointer-events-auto flex gap-3 bg-slate-800/90 backdrop-blur p-2 rounded-xl shadow-2xl border border-slate-700">
            {!chapter.isPdf && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadChapterZip(manga, chapter, pages); }}
                  className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                  title="Download ZIP"
                >
                  <Download size={18} />
                  <span className="text-[10px]">ZIP</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadChapterPdf(manga, chapter, pages); }}
                  className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                  title="Generate PDF"
                >
                  <FileText size={18} />
                  <span className="text-[10px]">PDF</span>
                </button>
              </>
            )}
            {chapter.isPdf && (
               <button 
                  onClick={(e) => { e.stopPropagation(); downloadRawPdf(chapter); }}
                  className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                >
                  <Download size={18} />
                  <span className="text-[10px]">Save</span>
                </button>
            )}
         </div>
      </div>

      {/* Reading Progress Bar (always visible thin line) */}
      <div className="h-1 bg-slate-900 w-full fixed bottom-0 left-0 z-50">
        <div className="h-full bg-blue-500 transition-all duration-150" style={{ width: `${readProgress}%` }} />
      </div>
    </div>
  );
};