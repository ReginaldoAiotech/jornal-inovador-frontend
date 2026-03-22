import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

export default function ImageGallery({ images = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () => setLightboxIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setLightboxIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <>
      {/* Grid de imagens */}
      <div className="my-8">
        <h3 className="text-lg font-semibold font-heading text-gray-900 mb-4">Galeria de imagens</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src={img.url}
                alt={img.caption || `Imagem ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {img.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-xs text-white truncate">{img.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 p-2 text-white/70 hover:text-white z-10"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 p-2 text-white/70 hover:text-white z-10"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] px-12" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || ''}
              className="max-w-full max-h-[75vh] object-contain mx-auto rounded-lg"
            />
            {(images[lightboxIndex].caption || images[lightboxIndex].credit) && (
              <div className="text-center mt-3">
                {images[lightboxIndex].caption && (
                  <p className="text-sm text-white">{images[lightboxIndex].caption}</p>
                )}
                {images[lightboxIndex].credit && (
                  <p className="text-xs text-gray-400 mt-1">{images[lightboxIndex].credit}</p>
                )}
              </div>
            )}
            <p className="text-center text-xs text-gray-500 mt-2">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
