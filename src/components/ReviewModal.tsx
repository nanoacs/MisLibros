import React, { useState, useEffect } from 'react';
import { BookReview, Genre, ReadingStatus, GENRE_OPTIONS, PRESET_COVER_PALETTES } from '../types';
import { X, Star, Plus, Trash2, BookOpen, Image, Sparkles, Search, Loader2, Check } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  initialReview?: BookReview | null;
  onClose: () => void;
  onSave: (review: Omit<BookReview, 'id' | 'createdAt'> & { id?: string }) => void;
  onOpenAiHelper?: (title: string, author: string, genre: string, currentText: string) => void;
}

interface GoogleBookItem {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  coverUrl?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  initialReview,
  onClose,
  onSave,
  onOpenAiHelper,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<Genre | string>('Ficción');
  const [customGenre, setCustomGenre] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [status, setStatus] = useState<ReadingStatus>('Leído');
  const [review, setReview] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverColor, setCoverColor] = useState(PRESET_COVER_PALETTES[0].class);
  const [pages, setPages] = useState<number | undefined>(undefined);
  const [favoriteQuotes, setFavoriteQuotes] = useState<string[]>([]);
  const [newQuote, setNewQuote] = useState('');

  // Google Books Search State
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);
  const [searchResults, setSearchResults] = useState<GoogleBookItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [errors, setErrors] = useState<{ title?: string; author?: string; review?: string }>({});

  useEffect(() => {
    if (initialReview) {
      setTitle(initialReview.title);
      setAuthor(initialReview.author);
      if (GENRE_OPTIONS.includes(initialReview.genre as Genre)) {
        setGenre(initialReview.genre);
        setCustomGenre('');
      } else {
        setGenre('Otros');
        setCustomGenre(initialReview.genre);
      }
      setDate(initialReview.date || new Date().toISOString().split('T')[0]);
      setRating(initialReview.rating);
      setStatus(initialReview.status || 'Leído');
      setReview(initialReview.review);
      setCoverUrl(initialReview.coverUrl || '');
      setCoverColor(initialReview.coverColor || PRESET_COVER_PALETTES[0].class);
      setPages(initialReview.pages);
      setFavoriteQuotes(initialReview.favoriteQuotes || []);
    } else {
      // Reset form
      setTitle('');
      setAuthor('');
      setGenre('Ficción');
      setCustomGenre('');
      setDate(new Date().toISOString().split('T')[0]);
      setRating(5);
      setStatus('Leído');
      setReview('');
      setCoverUrl('');
      setCoverColor(PRESET_COVER_PALETTES[0].class);
      setPages(undefined);
      setFavoriteQuotes([]);
    }
    setBookSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setErrors({});
  }, [initialReview, isOpen]);

  if (!isOpen) return null;

  const handleSearchGoogleBooks = async () => {
    const queryTerm = bookSearchQuery || title;
    if (!queryTerm.trim()) return;

    setIsSearchingBooks(true);
    setShowSearchResults(true);
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(queryTerm)}`);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (err) {
      console.error('Error searching Google Books:', err);
    } finally {
      setIsSearchingBooks(false);
    }
  };

  const handleSelectBook = (book: GoogleBookItem) => {
    setTitle(book.title);
    setAuthor(book.authors?.join(', ') || 'Desconocido');
    if (book.coverUrl) {
      setCoverUrl(book.coverUrl);
    }
    if (book.pageCount) {
      setPages(book.pageCount);
    }

    // Try to match category to genre
    if (book.categories && book.categories.length > 0) {
      const cat = book.categories[0].toLowerCase();
      if (cat.includes('fiction')) setGenre('Ficción');
      else if (cat.includes('history') || cat.includes('biography')) setGenre('Historia y Biografía');
      else if (cat.includes('science') || cat.includes('fantasy')) setGenre('Fantasía');
      else if (cat.includes('romance')) setGenre('Romance');
      else if (cat.includes('poetry')) setGenre('Poesía');
      else {
        setGenre('Otros');
        setCustomGenre(book.categories[0]);
      }
    }

    setShowSearchResults(false);
  };

  const handleAddQuote = () => {
    if (newQuote.trim()) {
      setFavoriteQuotes([...favoriteQuotes, newQuote.trim()]);
      setNewQuote('');
    }
  };

  const handleRemoveQuote = (index: number) => {
    setFavoriteQuotes(favoriteQuotes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; author?: string; review?: string } = {};

    if (!title.trim()) newErrors.title = 'El título es obligatorio.';
    if (!author.trim()) newErrors.author = 'El autor es obligatorio.';
    if (!review.trim()) newErrors.review = 'Por favor escribe tu reseña u opinión.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalGenre = genre === 'Otros' && customGenre.trim() ? customGenre.trim() : genre;

    onSave({
      ...(initialReview?.id ? { id: initialReview.id } : {}),
      title: title.trim(),
      author: author.trim(),
      genre: finalGenre,
      date,
      rating,
      status,
      review: review.trim(),
      coverUrl: coverUrl.trim() || undefined,
      coverColor,
      pages: pages ? Number(pages) : undefined,
      favoriteQuotes,
    });

    onClose();
  };

  const ratingLabels: Record<number, string> = {
    1: '1/5 - Pésimo',
    2: '2/5 - Regular',
    3: '3/5 - Bueno',
    4: '4/5 - Muy Bueno',
    5: '5/5 - Excelente / Obra Maestra',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-zinc-100 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/80 border border-sky-800/60 text-sky-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-zinc-100">
                {initialReview ? 'Editar Reseña de Libro' : 'Nueva Reseña de Libro'}
              </h2>
              <p className="text-xs text-zinc-400">
                Registra todos los detalles e impresiones de tu lectura
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          
          {/* Google Books Search Bar (Auto-fill) */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Buscar en Google Books (Autocompletar)
              </span>
              <span className="text-[10px] text-zinc-400">Encuentra la portada y datos oficiales</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Busca por título o autor (Ej. Cien años de soledad)..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchGoogleBooks();
                  }
                }}
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-sky-600 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearchGoogleBooks}
                disabled={isSearchingBooks}
                className="px-3.5 py-1.5 bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                {isSearchingBooks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </div>

            {/* Google Books Search Results Dropdown */}
            {showSearchResults && (
              <div className="mt-2 bg-zinc-900 border border-zinc-800 rounded-xl max-h-52 overflow-y-auto p-2 space-y-1.5 shadow-xl">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-zinc-400 p-2 text-center">
                    {isSearchingBooks ? 'Buscando libros...' : 'No se encontraron resultados. Intenta otra palabra clave.'}
                  </p>
                ) : (
                  searchResults.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleSelectBook(book)}
                      className="p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors flex items-center gap-3 border border-transparent hover:border-sky-700/30"
                    >
                      <div className="w-9 h-12 bg-zinc-800 rounded overflow-hidden shrink-0 border border-zinc-700 flex items-center justify-center">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-100 truncate">{book.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">Por {book.authors?.join(', ')}</p>
                        {book.pageCount && (
                          <p className="text-[10px] text-sky-300 font-mono">{book.pageCount} páginas</p>
                        )}
                      </div>
                      <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800/60 px-2 py-1 rounded font-medium shrink-0">
                        Seleccionar
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Título del Libro <span className="text-sky-400">*</span>
              </label>
              <input
                id="input-title"
                type="text"
                placeholder="Ej. Cien años de soledad"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Autor <span className="text-sky-400">*</span>
              </label>
              <input
                id="input-author"
                type="text"
                placeholder="Ej. Gabriel García Márquez"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
              {errors.author && <p className="text-xs text-red-400 mt-1">{errors.author}</p>}
            </div>
          </div>

          {/* Genre & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Género
              </label>
              <select
                id="select-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-600"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {genre === 'Otros' && (
                <input
                  type="text"
                  placeholder="Especificar género personalizado..."
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  className="w-full mt-2 bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Fecha de Lectura
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Rating & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Calificación
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentDisplay = hoverRating !== null ? hoverRating : rating;
                  const isFilled = currentDisplay >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          isFilled
                            ? 'text-sky-400 fill-sky-400'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-sky-300 font-medium mt-1.5">
                {ratingLabels[hoverRating !== null ? hoverRating : rating]}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Estado de Lectura
              </label>
              <div className="flex items-center gap-2">
                {(['Leído', 'Leyendo', 'Por Leer'] as ReadingStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      status === st
                        ? 'bg-sky-950 text-sky-300 border-sky-800/60'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review / Reseña */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Reseña y Opinión Personal <span className="text-sky-400">*</span>
              </label>
              {onOpenAiHelper && (
                <button
                  type="button"
                  onClick={() => onOpenAiHelper(title, author, String(genre), review)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generar/Pulir con AI</span>
                </button>
              )}
            </div>
            <textarea
              id="input-review"
              rows={5}
              placeholder="Escribe aquí tus impresiones, análisis, qué te pareció la historia, personajes o aprendizajes..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-600 font-serif leading-relaxed"
            />
            {errors.review && <p className="text-xs text-red-400 mt-1">{errors.review}</p>}
          </div>

          {/* Favorite Quotes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Citas Destacadas (Opcional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Escribe una cita memorable del libro..."
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQuote();
                  }
                }}
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddQuote}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-sky-300 rounded-lg text-xs font-medium border border-zinc-700 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            {favoriteQuotes.length > 0 && (
              <div className="space-y-2 mt-2">
                {favoriteQuotes.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 italic font-serif"
                  >
                    <span>"{q}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuote(idx)}
                      className="text-zinc-500 hover:text-red-400 ml-2 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cover customization */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-sky-400" /> Portada del Libro
            </label>
            
            <div className="space-y-3">
              <div>
                <input
                  type="url"
                  placeholder="URL de imagen de portada (https://...)"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <p className="text-[11px] text-zinc-400 mb-1.5">O elige un estilo de color degradado:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COVER_PALETTES.map((pal) => (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => setCoverColor(pal.class)}
                      className={`h-8 w-14 rounded-md border text-[10px] font-medium text-zinc-200 transition-all ${pal.class} ${
                        coverColor === pal.class ? 'border-sky-400 ring-2 ring-sky-400/50' : 'border-zinc-700 opacity-80 hover:opacity-100'
                      }`}
                      title={pal.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-review"
              type="submit"
              className="px-5 py-2 bg-sky-800 hover:bg-sky-700 text-white rounded-lg text-sm font-bold shadow transition-colors"
            >
              {initialReview ? 'Guardar Cambios' : 'Publicar Reseña'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
