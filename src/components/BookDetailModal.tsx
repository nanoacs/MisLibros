import React, { useState } from 'react';
import { BookReview } from '../types';
import { X, Star, Calendar, Bookmark, Quote, Edit3, Trash2, Copy, Check, Share2, BookOpen } from 'lucide-react';

interface BookDetailModalProps {
  review: BookReview | null;
  onClose: () => void;
  onEdit: (review: BookReview) => void;
  onDelete: (id: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  review,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!review) return null;

  const handleCopyText = () => {
    const textToCopy = `📚 RESEÑA DE LIBRO: "${review.title}" de ${review.author}\n⭐ Calificación: ${review.rating}/5 | Género: ${review.genre}\n📅 Fecha de lectura: ${review.date}\n\nRESEÑA:\n${review.review}\n\n${
      review.favoriteQuotes && review.favoriteQuotes.length > 0
        ? `CITAS DESTACADAS:\n${review.favoriteQuotes.map((q) => `• "${q}"`).join('\n')}`
        : ''
    }`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const bgGradient = review.coverColor || 'bg-gradient-to-br from-indigo-900 to-slate-950';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-zinc-100 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          id="btn-close-detail"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-700/80 rounded-full text-zinc-300 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Banner */}
        <div className={`relative h-56 sm:h-64 p-6 flex items-end ${bgGradient}`}>
          {review.coverUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={review.coverUrl}
                alt={review.title}
                className="w-full h-full object-cover opacity-30 blur-sm scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
            </div>
          )}

          <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start sm:items-end w-full">
            {/* Book Cover Box */}
            <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl overflow-hidden shadow-xl border-2 border-zinc-700 shrink-0 bg-zinc-800 flex items-center justify-center">
              {review.coverUrl ? (
                <img
                  src={review.coverUrl}
                  alt={review.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <BookOpen className="w-10 h-10 text-zinc-400 opacity-60" />
              )}
            </div>

            {/* Book Header Title & Meta */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-sky-950/80 text-sky-300 border border-sky-800/60 text-xs px-2.5 py-1 rounded-md font-medium">
                  {review.genre}
                </span>
                <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 text-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  {review.date}
                </span>
                {review.pages && (
                  <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 text-xs px-2.5 py-1 rounded-md font-mono">
                    {review.pages} pág.
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 leading-tight">
                {review.title}
              </h2>
              <p className="text-zinc-300 font-sans text-sm sm:text-base mt-0.5">
                Por <span className="text-sky-200 font-medium">{review.author}</span>
              </p>

              {/* Score Stars */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        review.rating >= star
                          ? 'text-sky-400 fill-sky-400'
                          : review.rating >= star - 0.5
                          ? 'text-sky-400 fill-sky-400/50'
                          : 'text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-sky-300 font-bold text-sm bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded-md">
                  {review.rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-sans">
          
          {/* Main Review Text */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" /> Reseña y Reflexión Personal
            </h4>
            <div className="text-zinc-200 text-base leading-relaxed whitespace-pre-line bg-zinc-950/60 p-5 rounded-xl border border-zinc-800 font-serif">
              {review.review}
            </div>
          </div>

          {/* Favorite Quotes Section */}
          {review.favoriteQuotes && review.favoriteQuotes.length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
                <Quote className="w-4 h-4" /> Citas Destacadas
              </h4>
              <div className="space-y-3">
                {review.favoriteQuotes.map((quote, idx) => (
                  <blockquote
                    key={idx}
                    className="p-4 bg-sky-950/30 border-l-4 border-sky-600 rounded-r-xl text-zinc-200 italic font-serif text-sm leading-relaxed"
                  >
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-copy-review"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Reseña'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-edit-modal"
              onClick={() => {
                onClose();
                onEdit(review);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              id="btn-delete-modal"
              onClick={() => {
                onDelete(review.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-medium rounded-lg border border-red-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
