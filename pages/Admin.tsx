import React, { useState, useEffect } from 'react';
import { Upload, Plus, FileText, Image as ImageIcon, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { createManga, uploadChapterImages, uploadChapterPdf, getMangaCatalog } from '../services/mangaService';
import { Manga, MangaStatus } from '../types';

export const Admin: React.FC = () => {
  // Tabs: 'manga' | 'chapter'
  const [activeTab, setActiveTab] = useState('manga');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Manga Form State
  const [mangaTitle, setMangaTitle] = useState('');
  const [mangaDesc, setMangaDesc] = useState('');
  const [mangaAuthor, setMangaAuthor] = useState('');
  const [mangaStatus, setMangaStatus] = useState<MangaStatus>(MangaStatus.ONGOING);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Chapter Form State
  const [selectedMangaId, setSelectedMangaId] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [uploadMode, setUploadMode] = useState<'images' | 'pdf'>('images');
  const [chapterFiles, setChapterFiles] = useState<FileList | null>(null);
  const [chapterPdf, setChapterPdf] = useState<File | null>(null);

  // Data for Select
  const [mangaList, setMangaList] = useState<Manga[]>([]);

  useEffect(() => {
    refreshMangaList();
  }, []);

  const refreshMangaList = () => {
    getMangaCatalog().then(setMangaList);
  };

  const handleMangaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverFile) {
      setErrorMsg("Cover image is required");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await createManga(mangaTitle, mangaDesc, coverFile, mangaAuthor, mangaStatus);
      setSuccessMsg("Manga created successfully!");
      setMangaTitle('');
      setMangaDesc('');
      setMangaAuthor('');
      setCoverFile(null);
      refreshMangaList();
    } catch (err) {
      setErrorMsg("Failed to create manga.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId) {
      setErrorMsg("Please select a manga");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const num = parseFloat(chapterNum);
      if (uploadMode === 'images') {
        if (!chapterFiles || chapterFiles.length === 0) throw new Error("No images selected");
        // Convert FileList to Array
        const filesArray = Array.from(chapterFiles) as File[];
        await uploadChapterImages(selectedMangaId, num, chapterTitle, filesArray);
      } else {
        if (!chapterPdf) throw new Error("No PDF selected");
        await uploadChapterPdf(selectedMangaId, num, chapterTitle, chapterPdf);
      }
      setSuccessMsg(`Chapter ${num} uploaded successfully!`);
      setChapterNum('');
      setChapterTitle('');
      setChapterFiles(null);
      setChapterPdf(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400">Manage your manga library content</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('manga')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'manga' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            New Manga
          </button>
          <button
            onClick={() => setActiveTab('chapter')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'chapter' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Upload Chapter
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {activeTab === 'manga' ? (
        <form onSubmit={handleMangaSubmit} className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-xl border border-slate-700 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input 
                required
                type="text" 
                value={mangaTitle}
                onChange={(e) => setMangaTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. One Piece"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Author</label>
                <input 
                  type="text" 
                  value={mangaAuthor}
                  onChange={(e) => setMangaAuthor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Eiichiro Oda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select 
                  value={mangaStatus}
                  onChange={(e) => setMangaStatus(e.target.value as MangaStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={MangaStatus.ONGOING}>Ongoing</option>
                  <option value={MangaStatus.COMPLETED}>Completed</option>
                  <option value={MangaStatus.HIATUS}>Hiatus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea 
                required
                value={mangaDesc}
                onChange={(e) => setMangaDesc(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Synopsis..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cover Image</label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-700/50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-300">
                    {coverFile ? coverFile.name : "Click to upload cover"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : <><Save size={20} /> Create Manga</>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleChapterSubmit} className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-xl border border-slate-700 space-y-6">
           <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Select Manga</label>
              <select 
                required
                value={selectedMangaId}
                onChange={(e) => setSelectedMangaId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Choose Manga --</option>
                {mangaList.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Chapter #</label>
                <input 
                  required
                  type="number" 
                  step="0.1"
                  value={chapterNum}
                  onChange={(e) => setChapterNum(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title (Optional)</label>
                <input 
                  type="text" 
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="The Beginning"
                />
              </div>
            </div>

            <div className="bg-slate-900/50 p-1 rounded-lg flex mb-2">
               <button
                  type="button"
                  onClick={() => setUploadMode('images')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition ${uploadMode === 'images' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
               >
                 <ImageIcon size={16} /> Image Folder
               </button>
               <button
                  type="button"
                  onClick={() => setUploadMode('pdf')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition ${uploadMode === 'pdf' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
               >
                 <FileText size={16} /> PDF File
               </button>
            </div>

            {uploadMode === 'images' ? (
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition relative">
                 <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  onChange={(e) => setChapterFiles(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-blue-500 mb-2" />
                  <span className="text-white font-medium mb-1">
                    {chapterFiles && chapterFiles.length > 0 
                      ? `${chapterFiles.length} files selected`
                      : "Drop images here or click to upload"}
                  </span>
                  <span className="text-xs text-slate-400">Supported: JPG, PNG, WEBP</span>
                </div>
              </div>
            ) : (
               <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition relative">
                 <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setChapterPdf(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-red-500 mb-2" />
                  <span className="text-white font-medium mb-1">
                    {chapterPdf ? chapterPdf.name : "Click to upload PDF"}
                  </span>
                </div>
              </div>
            )}
           </div>

           <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Uploading...' : <><Upload size={20} /> Upload Chapter</>}
          </button>
        </form>
      )}
    </div>
  );
};