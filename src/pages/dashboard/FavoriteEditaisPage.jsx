import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePagination } from '../../hooks/usePagination';
import { getFavorites } from '../../services/editalService';
import EditalCard from '../../components/common/EditalCard';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Star } from 'lucide-react';

export default function FavoriteEditaisPage() {
  useDocumentTitle('Editais Favoritos');
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, totalPages, setPage, setTotal } = usePagination(1, 12);

  useEffect(() => {
    setLoading(true);
    getFavorites({ page, limit: 12 })
      .then((res) => {
        setEditais(res?.data || []);
        setTotal(res?.total || 0);
      })
      .catch(() => setEditais([]))
      .finally(() => setLoading(false));
  }, [page, setTotal]);

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Editais Favoritos</h1>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : editais.length === 0 ? (
        <EmptyState icon={Star} title="Nenhum edital favorito" description="Favorite editais para acompanha-los aqui." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editais.map((edital) => (
              <EditalCard key={edital.id} edital={edital} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
