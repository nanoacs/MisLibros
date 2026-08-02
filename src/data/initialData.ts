import { BookReview } from '../types';

export const INITIAL_BOOK_REVIEWS: BookReview[] = [
  {
    id: '1',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    genre: 'Realismo Mágico',
    date: '2026-03-15',
    rating: 5,
    status: 'Leído',
    pages: 471,
    coverColor: 'bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-950',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    review: 'Una obra cumbre e inolvidable de la literatura universal. Macondo cobra vida a través de siete generaciones de la familia Buendía. La prosa de García Márquez combina la cotidianidad con la magia más deslumbrante de una manera tan natural que resulta imposible no sumergirse por completo. El tema de la soledad cíclica y el destino me estremeció de principio a fin.',
    favoriteQuotes: [
      'Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.',
      'El secreto de una buena vejez no es otra cosa que un pacto honrado con la soledad.'
    ],
    createdAt: 1773532800000,
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Ciencia Ficción',
    date: '2026-04-02',
    rating: 5,
    status: 'Leído',
    pages: 328,
    coverColor: 'bg-gradient-to-br from-indigo-900 via-slate-900 to-zinc-950',
    coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80',
    review: 'Un clásico distópico extremadamente vigente y escalofriante. La opresión del Gran Hermano, la manipulación del lenguaje (Neolengua) y la alteración constante de la verdad histórica invitan a una profunda reflexión sobre la libertad humana, la privacidad y el poder.',
    favoriteQuotes: [
      'Quien controla el presente controla el pasado y quien controla el pasado controlará el futuro.',
      'La libertad es la libertad de decir que dos más dos son cuatro.'
    ],
    createdAt: 1775088000000,
  },
  {
    id: '3',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Ficción',
    date: '2026-05-10',
    rating: 5,
    status: 'Leído',
    pages: 96,
    coverColor: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    review: 'Un libro poético y filosófico que se reinterpreta de manera distinta en cada etapa de la vida. La inocencia del Principito y sus encuentros con los habitantes de los distintos asteroides nos recuerdan lo verdaderamente valioso frente al ruido del mundo adulto.',
    favoriteQuotes: [
      'Sólo con el corazón se puede ver bien; lo esencial es invisible para los ojos.',
      'Fue el tiempo que pasaste con tu rosa lo que la hizo tan importante.'
    ],
    createdAt: 1778371200000,
  },
  {
    id: '4',
    title: 'Sapiens: De animales a dioses',
    author: 'Yuval Noah Harari',
    genre: 'Historia y Biografía',
    date: '2026-06-20',
    rating: 4,
    status: 'Leído',
    pages: 496,
    coverColor: 'bg-gradient-to-br from-sky-900 via-blue-950 to-slate-950',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    review: 'Un recorrido apasionante por la historia de la humanidad. Harari plantea hipótesis fascinantes sobre la revolución cognitiva, la invención del dinero, los mitos compartidos y el avance agrícola y tecnológico. Cambió por completo mi perspectiva sobre las instituciones creadas por el ser humano.',
    favoriteQuotes: [
      'Los mitos compartidos son los que otorgan a los Homo sapiens la habilidad única de cooperar en masa.'
    ],
    createdAt: 1781913600000,
  },
  {
    id: '5',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    genre: 'Ciencia Ficción',
    date: '2026-07-01',
    rating: 4.5,
    status: 'Leído',
    pages: 256,
    coverColor: 'bg-gradient-to-br from-purple-900 via-violet-950 to-slate-950',
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    review: 'Una vibrante carta de amor a los libros y al pensamiento crítico. Bradbury nos sitúa en una sociedad donde los bomberos queman libros en lugar de apagar incendios. Montag es un personaje memorable en su despertar intelectual.',
    favoriteQuotes: [
      'Un libro es una pistola cargada en la casa de al lado. Quémalo. Quita la bala del arma.'
    ],
    createdAt: 1782864000000,
  }
];
