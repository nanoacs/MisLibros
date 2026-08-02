export type Genre =
  | 'Ficción'
  | 'No Ficción'
  | 'Realismo Mágico'
  | 'Ciencia Ficción'
  | 'Fantasía'
  | 'Misterio y Thriller'
  | 'Filosofía y Ensayos'
  | 'Desarrollo Personal'
  | 'Historia y Biografía'
  | 'Poesía'
  | 'Romance'
  | 'Otros';

export type ReadingStatus = 'Leído' | 'Leyendo' | 'Por Leer';

export interface BookReview {
  id: string;
  title: string;
  author: string;
  genre: Genre | string;
  date: string; // YYYY-MM-DD
  rating: number; // 1 to 5
  review: string;
  status: ReadingStatus;
  favoriteQuotes?: string[];
  coverUrl?: string;
  coverColor?: string; // e.g., 'from-amber-700 to-amber-900'
  pages?: number;
  tags?: string[];
  createdAt: number;
}

export type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc' | 'title-asc';

export const GENRE_OPTIONS: Genre[] = [
  'Ficción',
  'No Ficción',
  'Realismo Mágico',
  'Ciencia Ficción',
  'Fantasía',
  'Misterio y Thriller',
  'Filosofía y Ensayos',
  'Desarrollo Personal',
  'Historia y Biografía',
  'Poesía',
  'Romance',
  'Otros',
];

export const PRESET_COVER_PALETTES = [
  { name: 'Azul Zafiro', class: 'bg-gradient-to-br from-slate-800 via-blue-950 to-neutral-950' },
  { name: 'Violeta Nocturno', class: 'bg-gradient-to-br from-slate-900 via-purple-950 to-neutral-950' },
  { name: 'Azul Acero', class: 'bg-gradient-to-br from-slate-800 via-slate-900 to-neutral-950' },
  { name: 'Misterio Oscuro', class: 'bg-gradient-to-br from-zinc-900 via-slate-900 to-neutral-950' },
  { name: 'Crepúsculo Sereno', class: 'bg-gradient-to-br from-slate-800 via-sky-950 to-neutral-950' },
  { name: 'Lavanda Atenuada', class: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-neutral-950' },
];
