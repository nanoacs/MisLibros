import React from 'react';
import { BookOpen, Plus, Sparkles, Download, RefreshCw, BookmarkCheck, User as UserIcon, LogOut, Cloud, CloudOff } from 'lucide-react';
import type { User } from '../lib/firebase';

interface HeaderProps {
  user: User | null;
  isSyncing: boolean;
  onLoginGoogle: () => void;
  onLogout: () => void;
  onOpenNewReview: () => void;
  onOpenAiAssistant: () => void;
  onOpenExportImport: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isSyncing,
  onLoginGoogle,
  onLogout,
  onOpenNewReview,
  onOpenAiAssistant,
  onOpenExportImport,
  onResetData,
}) => {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold tracking-tight text-zinc-100">
                  Mis Libros
                </h1>
                <span className="bg-sky-950/80 text-sky-300 text-xs font-mono font-medium px-2 py-0.5 rounded-full border border-sky-800/60 flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3" /> Reseñas
                </span>
                {user ? (
                  <span className="bg-emerald-950/80 text-emerald-400 text-[11px] font-mono px-2 py-0.5 rounded-full border border-emerald-800/60 flex items-center gap-1" title="Sincronizado en Firebase Cloud">
                    <Cloud className="w-3 h-3" /> Nube Activa
                  </span>
                ) : (
                  <span className="bg-zinc-900 text-zinc-400 text-[11px] font-mono px-2 py-0.5 rounded-full border border-zinc-800 flex items-center gap-1" title="Modo Local">
                    <CloudOff className="w-3 h-3" /> Local
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Mi espacio personal de lecturas, valoraciones y reflexiones
              </p>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id="btn-new-review"
              onClick={onOpenNewReview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-800 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nueva Reseña</span>
            </button>

            <button
              id="btn-ai-assistant"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-purple-300 font-medium text-sm rounded-lg border border-purple-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Asistente AI</span>
            </button>

            <button
              id="btn-export-import"
              onClick={onOpenExportImport}
              className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-sm rounded-lg border border-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
              title="Exportar o Importar datos"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Respaldos</span>
            </button>

            {/* Firebase Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Usuario'} className="w-8 h-8 rounded-full border border-sky-800/60" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-950/80 text-sky-300 flex items-center justify-center font-bold text-xs border border-sky-800">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-zinc-200 line-clamp-1">{user.displayName || user.email || 'Lector'}</p>
                  <p className="text-[10px] text-zinc-400">Sincronizado</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginGoogle}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-950/80 hover:bg-sky-900/90 text-sky-300 font-medium text-xs rounded-lg border border-sky-800/60 transition-colors"
                title="Iniciar sesión para guardar en la nube"
              >
                <UserIcon className="w-4 h-4" />
                <span>Iniciar Sesión Nube</span>
              </button>
            )}

            <button
              id="btn-reset-demo"
              onClick={onResetData}
              className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Restablecer datos de ejemplo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
