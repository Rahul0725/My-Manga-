import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { MangaDetails } from './pages/MangaDetails';
import { Reader } from './pages/Reader';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { initDB } from './services/db';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize the local database (simulating backend)
    initDB().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse">Loading MyManga Core...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="manga/:id" element={<MangaDetails />} />
            <Route path="admin" element={<Admin />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
          <Route path="/read/:chapterId" element={<Reader />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;