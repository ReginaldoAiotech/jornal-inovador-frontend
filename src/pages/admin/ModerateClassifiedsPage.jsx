import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePagination } from '../../hooks/usePagination';
import { getPendingClassifieds, moderateClassified } from '../../services/classifiedService';
import CategoryBadge from '../../components/common/CategoryBadge';
import DateDisplay from '../../components/common/DateDisplay';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ModerateClassifiedsPage() {
  useDocumentTitle('Moderar Classificados');
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { page, totalPages, setPage, setTotal } = usePagination();

  const fetchData = () => {
    setLoading(true);
    getPendingClassifieds({ page, limit: 10 })
      .then((res) => {
        setClassifieds(res?.data || []);
        setTotal(res?.total || 0);
      })
      .catch(() => setClassifieds([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleApprove = async (id) => {
    try {
      await moderateClassified(id, 'APPROVED');
      toast.success('Classificado aprovado!');
      fetchData();
    } catch {
      toast.error('Erro ao aprovar');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Informe o motivo da rejeicao');
      return;
    }
    try {
      await moderateClassified(rejectId, 'REJECTED', rejectReason);
      toast.success('Classificado rejeitado');
      setRejectId(null);
      setRejectReason('');
      fetchData();
    } catch {
      toast.error('Erro ao rejeitar');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Classificados Pendentes</h1>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : classifieds.length === 0 ? (
        <EmptyState title="Nenhum classificado pendente" description="Todos os classificados foram moderados." />
      ) : (
        <>
          <div className="space-y-4">
            {classifieds.map((c) => (
              <Card key={c.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge category={c.category} type="classified" />
                      <DateDisplay date={c.createdAt} relative className="text-xs text-gray-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{c.description}</p>
                {c.user && <p className="text-xs text-gray-400">Por: {c.user.name || c.user.email}</p>}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="primary" onClick={() => handleApprove(c.id)}>
                    <CheckCircle className="h-4 w-4" /> Aprovar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectId(c.id)}>
                    <XCircle className="h-4 w-4" /> Rejeitar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!rejectId} onClose={() => { setRejectId(null); setRejectReason(''); }} title="Rejeitar classificado">
        <Textarea
          label="Motivo da rejeicao *"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Informe o motivo..."
          rows={3}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => { setRejectId(null); setRejectReason(''); }}>Cancelar</Button>
          <Button variant="danger" onClick={handleReject}>Rejeitar</Button>
        </div>
      </Modal>
    </div>
  );
}
