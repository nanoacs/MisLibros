import React from 'react';
import { BookReview } from '../types';
import { Star, Calendar, Quote, Edit3, Trash2, Eye, BookOpen } from 'lucide-react';

interface BookCardProps {
  review: BookReview;
  viewMode: 'grid' | 'list';
  onViewDetail: (review: BookReview) => void;
  onEdit: (review: BookReview) => void;
  onDelete: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  review,
  viewMode,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  // Render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5" title={`Calificación: ${rating} de 5`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = rating >= star;
          const isHalf = rating >= star - 0.5 && rating < star;
          return (
            <Star
              key={star}
              className={`w-4 h-4 ${
                isFull
                  ? 'text-sky-400 fill-sky-400'
                  : isHalf
                  ? 'text-sky-400 fill-sky-400/50'
                  : 'text-zinc-600'
              }`}
            />
          );
        })}
        <span className="ml-1.5 text-xs font-mono font-bold text-sky-300">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const bgGradient = review.coverColor || 'bg-gradient-to-br from-slate-800 to-zinc-950';

  if (viewMode === 'list') {
    return (
      <div
        id={`book-card-list-${review.id}`}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-sky-700/50 transition-all shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Miniature cover */}
          <div
            onClick={() => onViewDetail(review)}
            className={`w-14 h-20 rounded-lg shrink-0 overflow-hidden shadow cursor-pointer border border-zinc-700 flex items-center justify-center ${bgGradient}`}
          >
            {review.coverUrl ? (
              <img
                src={review.coverUrl}
                alt={review.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <BookOpen className="w-6 h-6 text-zinc-400 opacity-60" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="bg-zinc-950 text-sky-300 text-xs px-2 py-0.5 rounded-md border border-zinc-800 font-medium">
                {review.genre}
              </span>
              <span className="text-zinc-400 text-xs flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-zinc-500" />
                {review.date}
              </span>
            </div>

            <h3
              onClick={() => onViewDetail(review)}
              className="text-lg font-serif font-bold text-zinc-100 hover:text-sky-300 cursor-pointer truncate"
            >
              {review.title}
            </h3>
            <p className="text-xs text-zinc-400 mb-2">Por {review.author}</p>

            <div className="flex items-center gap-3">
              {renderStars(review.rating)}
              {review.favoriteQuotes && review.favoriteQuotes.length > 0 && (
                <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                  <Quote className="w-3 h-3 text-purple-400/80" />
                  {review.favoriteQuotes.length} {review.favoriteQuotes.length === 1 ? 'cita' : 'citas'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* List item actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            id={`btn-view-${review.id}`}
            onClick={() => onViewDetail(review)}
            className="p-2 text-zinc-400 hover:text-sky-300 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Ver reseña completa"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            id={`btn-edit-${review.id}`}
            onClick={() => onEdit(review)}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Editar reseña"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            id={`btn-delete-${review.id}`}
            onClick={() => onDelete(review.id)}
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Eliminar reseña"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      id={`book-card-grid-${review.id}`}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-sky-700/50 transition-all duration-200 shadow-md flex flex-col group"
    >
      {/* Cover Header Banner */}
      <div
        onClick={() => onViewDetail(review)}
        className={`relative h-48 cursor-pointer overflow-hidden flex items-center justify-center ${bgGradient}`}
      >
        {review.coverUrl ? (
          <img
            src={review.coverUrl}
            alt={review.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="p-6 text-center text-zinc-200">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50 text-sky-200" />
            <p className="font-serif font-bold text-lg leading-tight px-2 drop-shadow-md">
              {review.title}
            </p>
            <p className="text-xs text-zinc-300 font-sans mt-1 opacity-80">{review.author}</p>
          </div>
        )}

        {/* Overlay Genre & Status Tags */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="bg-zinc-950/90 backdrop-blur-md text-sky-300 text-xs px-2.5 py-1 rounded-md border border-sky-800/40 font-medium shadow-sm">
            {review.genre}
          </span>
          <span className="bg-zinc-950/90 backdrop-blur-md text-zinc-300 text-xs px-2 py-0.5 rounded-md border border-zinc-800 font-mono">
            {review.status || 'Leído'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col">
        
        {/* Rating and Date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {renderStars(review.rating)}
          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-500" />
            {review.date}
          </span>
        </div>

        {/* Title & Author */}
        <h3
          onClick={() => onViewDetail(review)}
          className="text-lg font-serif font-bold text-zinc-100 hover:text-sky-300 cursor-pointer line-clamp-1 mb-0.5"
          title={review.title}
        >
          {review.title}
        </h3>
        <p className="text-xs text-zinc-400 mb-3 font-sans">
          Por <span className="text-zinc-300 font-medium">{review.author}</span>
        </p>

        {/* Review Snippet */}
        <p className="text-sm text-zinc-300 line-clamp-3 mb-4 leading-relaxed flex-1 font-sans">
          "{review.review}"
        </p>

        {/* Favorite Quote Badge if exists */}
        {review.favoriteQuotes && review.favoriteQuotes.length > 0 && (
          <div className="mb-4 p-2.5 bg-sky-950/40 border border-sky-900/40 rounded-lg text-xs text-sky-200/90 italic flex items-start gap-2">
            <Quote className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">"{review.favoriteQuotes[0]}"</span>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 mt-auto">
          <button
            id={`btn-read-full-${review.id}`}
            onClick={() => onViewDetail(review)}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Leer reseña completa</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              id={`btn-grid-edit-${review.id}`}
              onClick={() => onEdit(review)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
              title="Editar"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              id={`btn-grid-delete-${review.id}`}
              onClick={() => onDelete(review.id)}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
