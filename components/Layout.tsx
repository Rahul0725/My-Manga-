import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Shield, Home, User, LogIn, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 md:pb-0">
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight hidden sm:block">MyManga Reader</span>
            <span className="font-bold text-xl tracking-tight sm:hidden">MyManga</span>
          </Link>
          
          <div className="flex items-center gap-4">
             {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="hidden md:flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-full transition"
              >
                <Download size={14} /> Install App
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                 <div className="flex flex-col items-end hidden sm:flex">
                   <span className="text-sm font-medium text-white">{user.name}</span>
                   <span className="text-[10px] text-slate-400">{user.isAdmin ? 'Admin' : 'Reader'}</span>
                 </div>
                 {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`p-2 rounded-full transition ${
                      location.pathname === '/admin' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                 )}
                 <button 
                   onClick={logoutUser}
                   className="text-slate-400 hover:text-red-400 text-sm font-medium"
                 >
                   Logout
                 </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-blue-400 font-medium hover:text-blue-300">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 md:hidden z-50">
        <div className="flex justify-around items-center p-3">
          <Link to="/" className="flex flex-col items-center gap-1 text-slate-400 active:text-blue-400">
            <Home size={20} />
            <span className="text-[10px]">Home</span>
          </Link>
          
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick} 
              className="flex flex-col items-center gap-1 text-blue-400 active:text-white"
            >
              <Download size={20} />
              <span className="text-[10px]">Install</span>
            </button>
          )}

          {user && user.isAdmin && (
            <Link to="/admin" className="flex flex-col items-center gap-1 text-slate-400 active:text-blue-400">
              <Shield size={20} />
              <span className="text-[10px]">Admin</span>
            </Link>
          )}
           {!user && (
            <Link to="/login" className="flex flex-col items-center gap-1 text-slate-400 active:text-blue-400">
              <User size={20} />
              <span className="text-[10px]">Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};