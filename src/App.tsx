import React, { useState, useEffect, useMemo } from 'react';
import { BookReview, Genre, ReadingStatus, SortOption, GENRE_OPTIONS } from './types';
import { INITIAL_BOOK_REVIEWS } from './data/initialData';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { ReviewModal } from './components/ReviewModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ExportImportModal } from './components/ExportImportModal';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  db,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  User,
} from './lib/firebase';
import {
  Search,
  Filter,
  Grid,
  List,
  BookOpen,
  X,
  HelpCircle,
  Cloud,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Firebase Auth user
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Reviews state
  const [reviews, setReviews] = useState<BookReview[]>(() => {
    try {
      const saved = localStorage.getItem('mis_libros_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading reviews from localStorage:', err);
    }
    return INITIAL_BOOK_REVIEWS;
  });

  // Track Firebase Auth state & Firestore sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);
    // Subscribe to user's reviews subcollection in Firestore
    const userReviewsRef = collection(db, 'users', user.uid, 'reviews');
    const q = query(userReviewsRef);

    const unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const docs: BookReview[] = [];
        snapshot.forEach((docSnap) => {
          docs.push(docSnap.data() as BookReview);
        });

        if (docs.length > 0) {
          // Sort by date desc
          docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setReviews(docs);
        } else if (reviews.length > 0) {
          // Push initial local reviews to Firestore for new user sync
          reviews.forEach(async (rev) => {
            await setDoc(doc(db, 'users', user.uid, 'reviews', rev.id), rev);
          });
        }
        setIsSyncing(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setIsSyncing(false);
      }
    );

    return () => unsubscribeSnapshot();
  }, [user]);

  // Save to local storage as local backup
  useEffect(() => {
    try {
      localStorage.setItem('mis_libros_reviews', JSON.stringify(reviews));
    } catch (err) {
      console.error('Error saving reviews to localStorage:', err);
    }
  }, [reviews]);

  // Auth actions
  const handleLoginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error logging in with Google:', error);
      alert('No se pudo completar el inicio de sesión. Revisa las configuraciones de ventanas emergentes.');
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [selectedRating, setSelectedRating] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<BookReview | null>(null);

  const [selectedDetailReview, setSelectedDetailReview] = useState<BookReview | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContextData, setAiContextData] = useState<{ title?: string; author?: string; genre?: string; text?: string }>({});

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Interactive Question Banner state
  const [showQuestionsBanner, setShowQuestionsBanner] = useState(true);

  // Filter and Sort logic
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchAuthor = r.author.toLowerCase().includes(q);
          const matchGenre = r.genre.toLowerCase().includes(q);
          const matchReview = r.review.toLowerCase().includes(q);
          const matchQuotes = r.favoriteQuotes?.some((quote) => quote.toLowerCase().includes(q));
          if (!matchTitle && !matchAuthor && !matchGenre && !matchReview && !matchQuotes) {
            return false;
          }
        }

        // Genre filter
        if (selectedGenre !== 'Todos' && r.genre !== selectedGenre) {
          return false;
        }

        // Rating filter
        if (selectedRating === '5') {
          if (r.rating < 5) return false;
        } else if (selectedRating === '4+') {
          if (r.rating < 4) return false;
        } else if (selectedRating === '3+') {
          if (r.rating < 3) return false;
        }

        // Status filter
        if (selectedStatus !== 'Todos' && (r.status || 'Leído') !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortOption === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortOption === 'rating-desc') {
          return b.rating - a.rating;
        } else if (sortOption === 'rating-asc') {
          return a.rating - b.rating;
        } else if (sortOption === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [reviews, searchQuery, selectedGenre, selectedRating, selectedStatus, sortOption]);

  // Actions
  const handleSaveReview = async (reviewData: Omit<BookReview, 'id' | 'createdAt'> & { id?: string }) => {
    let finalReview: BookReview;

    if (reviewData.id) {
      // Edit existing
      const existing = reviews.find((r) => r.id === reviewData.id);
      finalReview = {
        ...reviewData,
        id: reviewData.id,
        createdAt: existing?.createdAt || Date.now(),
      } as BookReview;

      setReviews((prev) => prev.map((r) => (r.id === reviewData.id ? finalReview : r)));
    } else {
      // Create new
      finalReview = {
        ...reviewData,
        id: Date.now().toString(),
        createdAt: Date.now(),
      } as BookReview;

      setReviews((prev) => [finalReview, ...prev]);
    }

    // Sync to Firestore if user logged in
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'reviews', finalReview.id), finalReview);
      } catch (err) {
        console.error('Error saving review to Firestore:', err);
      }
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (selectedDetailReview?.id === id) {
        setSelectedDetailReview(null);
      }

      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'reviews', id));
        } catch (err) {
          console.error('Error deleting review from Firestore:', err);
        }
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer las reseñas de ejemplo iniciales? Se mantendrá el respaldo en tu navegador.')) {
      setReviews(INITIAL_BOOK_REVIEWS);
    }
  };

  const handleOpenAiHelper = (title: string, author: string, genre: string, text: string) => {
    setAiContextData({ title, author, genre, text });
    setIsAiModalOpen(true);
  };

  const handleImportReviews = (importedList: BookReview[]) => {
    setReviews(importedList);
    if (user) {
      importedList.forEach(async (rev) => {
        await setDoc(doc(db, 'users', user.uid, 'reviews', rev.id), rev);
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-sky-900 selection:text-white flex flex-col">
      {/* Navigation & Header */}
      <Header
        user={user}
        isSyncing={isSyncing}
        onLoginGoogle={handleLoginGoogle}
        onLogout={handleLogout}
        onOpenNewReview={() => {
          setEditingReview(null);
          setIsReviewModalOpen(true);
        }}
        onOpenAiAssistant={() => {
          setAiContextData({});
          setIsAiModalOpen(true);
        }}
        onOpenExportImport={() => setIsExportModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* User Configuration Confirmation Banner */}
        {showQuestionsBanner && (
          <div className="mb-6 p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-sky-950/60 border border-sky-800/40 text-sky-400 rounded-lg shrink-0 mt-0.5 sm:mt-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-xs text-zinc-300 space-y-1">
                <p className="font-bold text-sky-300 text-sm">
                  Configuración personalizada de "Mis Libros":
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-300 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1. Sincronización Nube en Firebase Activa
                  </span>
                  <span className="flex items-center gap-1 text-sky-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" /> 2. Reto Anual omitido
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 3. Búsqueda y Portadas con Google Books Activa
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowQuestionsBanner(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg shrink-0 self-end sm:self-center"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Stats Overview */}
        <StatsOverview reviews={reviews} />

        {/* Filter, Search & View Toolbar */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 mb-6 shadow-md space-y-4">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-input"
                type="text"
                placeholder="Buscar por título, autor, género, reseña o citas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode and Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Sort selector */}
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="date-desc">Fecha (Más recientes primero)</option>
                <option value="date-asc">Fecha (Más antiguas primero)</option>
                <option value="rating-desc">Calificación (Mayor a menor)</option>
                <option value="rating-asc">Calificación (Menor a mayor)</option>
                <option value="title-asc">Título (A-Z)</option>
              </select>

              {/* Rating selector */}
              <select
                id="rating-filter"
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="Todas">Calificación: Todas</option>
                <option value="5">Solo 5 Estrellas ★★★★★</option>
                <option value="4+">4+ Estrellas ★★★★☆</option>
                <option value="3+">3+ Estrellas ★★★☆☆</option>
              </select>

              {/* Status filter */}
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 focus:border-sky-600 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="Todos">Estado: Todos</option>
                <option value="Leído">Leídos</option>
                <option value="Leyendo">En Lectura</option>
                <option value="Por Leer">Por Leer</option>
              </select>

              {/* View Grid / List Toggle */}
              <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  id="btn-view-grid"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-sky-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Vista en Tarjetas"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  id="btn-view-list"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-sky-800 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Vista en Lista Compacta"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Genre Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            <span className="text-[11px] font-mono text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-sky-400" /> Géneros:
            </span>
            <button
              onClick={() => setSelectedGenre('Todos')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedGenre === 'Todos'
                  ? 'bg-sky-800 text-white font-bold border border-sky-700'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              Todos
            </button>
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedGenre === genre
                    ? 'bg-sky-800 text-white font-bold border border-sky-700'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

        </div>

        {/* Reviews Catalog Grid / List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 px-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-zinc-300">
              No se encontraron reseñas
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-6">
              Prueba cambiando la búsqueda o ajustando los filtros de género y calificación.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Todos');
                setSelectedRating('Todas');
                setSelectedStatus('Todos');
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-zinc-700 text-xs font-medium rounded-lg transition-colors"
            >
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-3'
            }
          >
            {filteredReviews.map((item) => (
              <BookCard
                key={item.id}
                review={item}
                viewMode={viewMode}
                onViewDetail={(r) => setSelectedDetailReview(r)}
                onEdit={(r) => {
                  setEditingReview(r);
                  setIsReviewModalOpen(true);
                }}
                onDelete={(id) => handleDeleteReview(id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black text-zinc-500 text-xs py-6 mt-12 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif text-zinc-400">
            <strong>Mis Libros</strong> &mdash; Tu bitácora literaria personal
          </p>
          <p className="text-[11px] font-mono text-zinc-500">
            {reviews.length} {reviews.length === 1 ? 'libro registrado' : 'libros registrados'}
          </p>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        initialReview={editingReview}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        onSave={handleSaveReview}
        onOpenAiHelper={handleOpenAiHelper}
      />

      <BookDetailModal
        review={selectedDetailReview}
        onClose={() => setSelectedDetailReview(null)}
        onEdit={(r) => {
          setEditingReview(r);
          setIsReviewModalOpen(true);
        }}
        onDelete={(id) => handleDeleteReview(id)}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        userReviews={reviews}
        initialTitle={aiContextData.title}
        initialAuthor={aiContextData.author}
        initialGenre={aiContextData.genre}
        initialText={aiContextData.text}
        onApplyText={(text) => {
          if (editingReview) {
            setEditingReview({ ...editingReview, review: text });
          }
        }}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        reviews={reviews}
        onImportReviews={handleImportReviews}
      />
    </div>
  );
}
