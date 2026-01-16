import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getMangaCatalog } from '../services/mangaService';
import { Manga } from '../types';

export const Home: React.FC = () => {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMangaCatalog().then(list => {
      setMangaList(list);
      setLoading(false);
    });
  }, []);

  const filteredManga = mangaList.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero / Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search manga..."
          className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading your library...</div>
      ) : filteredManga.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          {mangaList.length === 0 ? "No manga uploaded yet. Go to Admin to add some!" : "No results found."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredManga.map((manga) => (
            <Link key={manga.id} to={`/manga/${manga.id}`} className="group relative bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="aspect-[2/3] w-full overflow-hidden bg-slate-700">
                <img 
                  src={manga.coverImage} 
                  alt={manga.title} 
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 leading-tight mb-1">{manga.title}</h3>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-blue-600/80 text-blue-50">
                  {manga.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};