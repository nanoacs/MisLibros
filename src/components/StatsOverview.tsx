import React from 'react';
import { BookReview } from '../types';
import { BookOpenCheck, Star, Bookmark, Calendar } from 'lucide-react';

interface StatsOverviewProps {
  reviews: BookReview[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ reviews }) => {
  const readReviews = reviews.filter((r) => r.status === 'Leído' || !r.status);
  const totalRead = readReviews.length;

  const avgRating = totalRead > 0
    ? (readReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalRead).toFixed(1)
    : '0.0';

  // Calculate most popular genre
  const genreCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    if (r.genre) {
      genreCounts[r.genre] = (genreCounts[r.genre] || 0) + 1;
    }
  });

  let topGenre = 'N/A';
  let maxCount = 0;
  Object.entries(genreCounts).forEach(([genre, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topGenre = genre;
    }
  });

  // Count read in current year (2026)
  const currentYear = new Date().getFullYear();
  const readThisYear = reviews.filter((r) => {
    if (!r.date) return false;
    return new Date(r.date).getFullYear() === currentYear;
  }).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      <div id="stat-card-total" className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 bg-sky-950/60 border border-sky-800/40 text-sky-400 rounded-lg shrink-0">
          <BookOpenCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400">Total Leídos</p>
          <p className="text-xl font-bold font-mono text-zinc-100">{totalRead} <span className="text-xs text-zinc-400 font-sans font-normal">libros</span></p>
        </div>
      </div>

      <div id="stat-card-rating" className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 bg-purple-950/60 border border-purple-900/40 text-purple-400 rounded-lg shrink-0">
          <Star className="w-5 h-5 fill-purple-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400">Calificación Promedio</p>
          <p className="text-xl font-bold font-mono text-zinc-100">{avgRating} <span className="text-xs text-zinc-400 font-sans font-normal">/ 5.0</span></p>
        </div>
      </div>

      <div id="stat-card-genre" className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 bg-sky-950/60 border border-sky-800/40 text-sky-400 rounded-lg shrink-0">
          <Bookmark className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-400">Género Favorito</p>
          <p className="text-sm font-bold text-zinc-100 truncate">{topGenre}</p>
        </div>
      </div>

      <div id="stat-card-year" className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
        <div className="p-2.5 bg-sky-950/60 border border-sky-800/40 text-sky-400 rounded-lg shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400">Lecturas {currentYear}</p>
          <p className="text-xl font-bold font-mono text-zinc-100">{readThisYear} <span className="text-xs text-zinc-400 font-sans font-normal">libros</span></p>
        </div>
      </div>

    </div>
  );
};
