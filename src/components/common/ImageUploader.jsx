import { useState, useRef, useCallback } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadArticleImage } from '../../services/articleService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

export default function ImageUploader({ value, onChange, label, compact = false }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Imagem muito grande. Maximo 10MB.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      toast.error('Formato nao suportado. Use JPEG, PNG, GIF ou WebP.');
      return;
    }
    setUploading(true);
    try {
      const result = await uploadArticleImage(file);
      onChange(result.url);
      toast.success('Imagem enviada!');
    } catch {
      toast.error('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  // Se ja tem imagem, mostra preview com opcao de remover
  if (value) {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <img
            src={value}
            alt="Preview"
            className={cn('w-full object-cover', compact ? 'h-32' : 'h-48')}
            onError={(e) => { e.target.src = ''; e.target.alt = 'Erro ao carregar'; }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              title="Remover imagem"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 truncate">{value}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-3">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px',
            mode === 'upload'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Upload className="h-3.5 w-3.5" /> Enviar arquivo
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px',
            mode === 'url'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <LinkIcon className="h-3.5 w-3.5" /> Colar URL
        </button>
      </div>

      {mode === 'upload' ? (
        /* Drag & drop area */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-2',
            compact ? 'p-4' : 'p-8',
            dragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
              <span className="text-xs text-gray-500">Enviando...</span>
            </>
          ) : (
            <>
              <ImageIcon className={cn('text-gray-400', compact ? 'h-6 w-6' : 'h-8 w-8')} />
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <span className="text-primary-500 font-medium">Clique para selecionar</span>
                  {' '}ou arraste aqui
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, GIF ou WebP (max 10MB)</p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>
      ) : (
        /* URL input */
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); } }}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Usar
          </button>
        </div>
      )}
    </div>
  );
}
