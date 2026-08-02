import React, { useState } from 'react';
import { BookReview } from '../types';
import { X, Download, Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: BookReview[];
  onImportReviews: (imported: BookReview[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  reviews,
  onImportReviews,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  if (!isOpen) return null;

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mis_libros_resenas_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportMarkdown = () => {
    let md = `# MIS LIBROS - Catálogo de Reseñas\n\n_Generado el ${new Date().toLocaleDateString('es-ES')}_\n\n---\n\n`;
    reviews.forEach((r, i) => {
      md += `## ${i + 1}. ${r.title}\n`;
      md += `**Autor:** ${r.author}  \n`;
      md += `**Género:** ${r.genre}  \n`;
      md += `**Calificación:** ${'⭐'.repeat(Math.round(r.rating))} (${r.rating}/5)  \n`;
      md += `**Fecha de Lectura:** ${r.date}  \n\n`;
      md += `### Reseña:\n${r.review}\n\n`;
      if (r.favoriteQuotes && r.favoriteQuotes.length > 0) {
        md += `**Citas Destacadas:**\n`;
        r.favoriteQuotes.forEach((q) => {
          md += `> "${q}"\n\n`;
        });
      }
      md += `---\n\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mis_libros_resenas_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportReviews(json);
          setImportSuccess(`¡Se importaron ${json.length} reseñas exitosamente!`);
        } else {
          setImportError('El archivo no contiene una lista válida de reseñas.');
        }
      } catch (err) {
        setImportError('Error al leer el archivo JSON. Verifica el formato.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-zinc-100 relative my-auto font-sans space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xl font-serif font-bold text-zinc-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" /> Respaldos y Exportación
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
            Exportar Biblioteca ({reviews.length} reseñas)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportJson}
              className="p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2 bg-sky-950/80 border border-sky-800/60 text-sky-400 rounded-lg shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-200">Exportar JSON</p>
                <p className="text-[11px] text-zinc-400">Respaldo completo</p>
              </div>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2 bg-sky-950/80 border border-sky-800/60 text-sky-400 rounded-lg shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-200">Exportar Markdown</p>
                <p className="text-[11px] text-zinc-400">Formato de lectura</p>
              </div>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3 pt-3 border-t border-zinc-800">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
            Importar Respaldo JSON
          </h3>
          <label className="p-4 bg-zinc-950 hover:bg-zinc-800/80 border border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <Upload className="w-6 h-6 text-sky-400 mb-1" />
            <span className="text-xs font-medium text-zinc-200">Haz clic para seleccionar archivo JSON</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">O arrastra el archivo aquí</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {importError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
