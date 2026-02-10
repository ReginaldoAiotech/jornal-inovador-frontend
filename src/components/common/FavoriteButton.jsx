import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function FavoriteButton({ isFavorited = false, onClick }) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await onClick?.();
      setFavorited(!favorited);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'p-1.5 rounded-full transition-colors',
        favorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-400'
      )}
    >
      <Heart className={cn('h-5 w-5', favorited && 'fill-current')} />
    </button>
  );
}
