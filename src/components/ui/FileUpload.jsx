import { useState, useRef } from 'react';
import { Upload, X, Image, Film } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function FileUpload({ label, accept = 'image/*', onChange, preview, error, className }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const isVideo = accept.includes('video');

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    onChange?.(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFileName('');
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasPreview = preview || fileName;

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors text-center',
          dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50',
          error && 'border-red-300 bg-red-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {preview && !fileName && !isVideo && (
          <div className="mb-3">
            <img src={preview} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-cover" />
          </div>
        )}

        {preview && !fileName && isVideo && (
          <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Film className="h-5 w-5 text-primary-500" />
            <span>Video atual carregado</span>
          </div>
        )}

        {fileName ? (
          <div className="flex items-center justify-center gap-2">
            {isVideo ? <Film className="h-5 w-5 text-primary-500" /> : <Image className="h-5 w-5 text-primary-500" />}
            <span className="text-sm text-gray-700 truncate max-w-[200px]">{fileName}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-500">
              Clique ou arraste {isVideo ? 'o video' : 'a imagem'} aqui
            </p>
            <p className="text-xs text-gray-400">
              {isVideo ? 'MP4, WebM, MOV' : 'JPG, PNG, WebP'}
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
