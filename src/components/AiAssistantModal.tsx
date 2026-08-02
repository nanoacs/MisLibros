import React, { useState } from 'react';
import { BookReview } from '../types';
import { X, Sparkles, Wand2, Compass, Loader2, Copy, Check } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userReviews: BookReview[];
  initialTitle?: string;
  initialAuthor?: string;
  initialGenre?: string;
  initialText?: string;
  onApplyText?: (text: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  userReviews,
  initialTitle = '',
  initialAuthor = '',
  initialGenre = '',
  initialText = '',
  onApplyText,
}) => {
  const [activeTab, setActiveTab] = useState<'draft' | 'polish' | 'recommend'>('draft');
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [genre, setGenre] = useState(initialGenre);
  const [reviewText, setReviewText] = useState(initialText);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunAi = async (action: 'draft' | 'polish' | 'recommend') => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/ai/review-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title,
          author,
          genre,
          reviewText,
          userReviews: userReviews.map((r) => ({
            title: r.title,
            author: r.author,
            genre: r.genre,
            rating: r.rating,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo obtener respuesta de la IA.');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Error al comunicarse con la IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-zinc-100 relative my-auto font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/80 border border-sky-800/60 text-sky-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-zinc-100">Asistente AI de Reseñas</h2>
              <p className="text-xs text-zinc-400">Impulsado por Gemini 2.5 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-4">
          <button
            onClick={() => {
              setActiveTab('draft');
              setResult('');
            }}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'draft'
                ? 'border-sky-500 text-sky-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Generar Borrador</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('polish');
              setResult('');
            }}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'polish'
                ? 'border-sky-500 text-sky-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pulir Mi Texto</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('recommend');
              setResult('');
            }}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'recommend'
                ? 'border-sky-500 text-sky-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Recomendaciones</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'draft' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300">
                Escribe el título y autor del libro para que la IA genere puntos clave y preguntas guía para tu reseña:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Título del libro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-600"
                />
                <input
                  type="text"
                  placeholder="Autor"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-600"
                />
              </div>
              <button
                onClick={() => handleRunAi('draft')}
                disabled={loading || !title.trim()}
                className="w-full py-2.5 bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                <span>Generar Esquema de Reseña</span>
              </button>
            </div>
          )}

          {activeTab === 'polish' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300">
                Pega tus notas o borrador inicial. La IA mejorará la redacción y la fluidez manteniendo tu voz:
              </p>
              <textarea
                rows={4}
                placeholder="Pega aquí tu borrador inicial..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-600 font-serif"
              />
              <button
                onClick={() => handleRunAi('polish')}
                disabled={loading || !reviewText.trim()}
                className="w-full py-2.5 bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Pulir y Estilizar Reseña</span>
              </button>
            </div>
          )}

          {activeTab === 'recommend' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300">
                La IA analizará tus {userReviews.length} lecturas anteriores y sus calificaciones para proponerte 3 nuevos libros personalizados:
              </p>
              <button
                onClick={() => handleRunAi('recommend')}
                disabled={loading}
                className="w-full py-2.5 bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                <span>Obtener Recomendaciones Personalizadas</span>
              </button>
            </div>
          )}

          {/* Errors */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-sky-400">Respuesta de la AI</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-800"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  {onApplyText && activeTab === 'polish' && (
                    <button
                      onClick={() => {
                        onApplyText(result);
                        onClose();
                      }}
                      className="text-xs bg-sky-800 text-white font-bold px-2.5 py-1 rounded hover:bg-sky-700"
                    >
                      Usar en mi reseña
                    </button>
                  )}
                </div>
              </div>
              <div className="text-zinc-200 text-xs whitespace-pre-line leading-relaxed font-serif max-h-60 overflow-y-auto pr-1">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
