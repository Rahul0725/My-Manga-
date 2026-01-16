import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Layers, ArrowLeft, BookOpen, Eye, CheckCircle } from 'lucide-react';
import { getMangaDetails, getAllMangaProgress } from '../services/mangaService';
import { Manga, Chapter, ReadingProgress } from '../types';
import { useAuth } from '../context/AuthContext';

export const MangaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getMangaDetails(id).then(async data => {
        setManga(data.manga || null);
        setChapters(data.chapters);
        
        if (user && data.manga) {
          const progressList = await getAllMangaProgress(user.id, data.manga.id);
          const pMap: Record<string, ReadingProgress> = {};
          progressList.forEach(p => { pMap[p.chapterId] = p; });
          setProgressMap(pMap);
        }

        setLoading(false);
      });
    }
  }, [id, user]);

  if (loading) return <div className="p-10 text-center">Loading details...</div>;
  if (!manga) return <div className="p-10 text-center">Manga not found.</div>;

  return (
    <div className="animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 flex items-center text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
        {/* Cover */}
        <div className="w-full md:w-64 flex-shrink-0 mx-auto md:mx-0 max-w-[240px]">
          <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
             <img src={manga.coverImage} alt={manga.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white leading-tight">{manga.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
            <span className="flex items-center gap-1"><Layers size={14} /> {chapters.length} Chapters</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(manga.createdAt).toLocaleDateString()}</span>
            <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700">{manga.status}</span>
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{manga.description}</p>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
          <BookOpen className="text-blue-400" />
          Chapters
        </h2>

        {chapters.length === 0 ? (
          <div className="text-slate-500 italic">No chapters uploaded yet.</div>
        ) : (
          <div className="grid gap-2">
            {chapters.map(chapter => {
              const progress = progressMap[chapter.id];
              const isStarted = !!progress;
              const isFinished = progress && !chapter.isPdf && chapter.pageCount > 0 && progress.lastPage >= chapter.pageCount;

              return (
                <Link 
                  key={chapter.id}
                  to={`/read/${chapter.id}`}
                  className={`flex items-center justify-between p-4 rounded-lg group transition-colors border ${
                    isStarted ? 'bg-slate-800 border-slate-600' : 'bg-slate-800 border-transparent hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className={`font-bold transition-colors flex items-center gap-2 ${isFinished ? 'text-slate-500' : 'text-slate-200 group-hover:text-blue-300'}`}>
                      {isFinished && <CheckCircle size={16} className="text-green-500" />}
                      Chapter {chapter.number}
                      {chapter.title && <span className="font-normal text-slate-400 text-sm">- {chapter.title}</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{chapter.isPdf ? 'PDF' : `${chapter.pageCount} Pages`}</span>
                      {isStarted && !isFinished && (
                        <span className="text-blue-400 font-medium ml-2">
                          Page {progress.lastPage}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-2 rounded-full transition-all ${
                    isStarted ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    {isStarted ? <Eye size={16} /> : <BookOpen size={16} />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};