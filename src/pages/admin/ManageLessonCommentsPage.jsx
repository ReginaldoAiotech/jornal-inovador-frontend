import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, CornerDownRight, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getComments, deleteComment, moderateComment } from '../../services/courseService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const STATUS_CONFIG = {
  pending: { label: 'Pendente', variant: 'warning', icon: Clock },
  approved: { label: 'Aprovado', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Reprovado', variant: 'danger', icon: XCircle },
};

function getStatus(comment) {
  const s = comment.status?.toUpperCase();
  if (s === 'APPROVED' || comment.approved === true) return 'approved';
  if (s === 'REJECTED' || comment.approved === false) return 'rejected';
  if (s === 'PENDING') return 'pending';
  return 'pending';
}

function CommentStatusBadge({ comment }) {
  const status = getStatus(comment);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="inline-flex items-center gap-1 text-[10px]">
      <Icon className="h-3 w-3" /> {config.label}
    </Badge>
  );
}

function CommentActions({ id, comment, onApprove, onReject, onDelete }) {
  const status = getStatus(comment);
  return (
    <div className="flex items-center gap-1 shrink-0">
      {status !== 'approved' && (
        <button
          onClick={() => onApprove(id)}
          className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-500"
          title="Aprovar"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      )}
      {status !== 'rejected' && (
        <button
          onClick={() => onReject(id)}
          className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600"
          title="Reprovar"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onDelete(id)}
        className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-500"
        title="Excluir"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ManageLessonCommentsPage() {
  useDocumentTitle('Comentarios da Aula');
  const { lessonId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchComments = () => {
    setLoading(true);
    getComments(lessonId)
      .then((res) => {
        const d = res?.data?.data || res?.data || res || [];
        setComments(Array.isArray(d) ? d : []);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, [lessonId]);

  const handleApprove = async (commentId) => {
    try {
      await moderateComment(commentId, { status: 'APPROVED' });
      toast.success('Comentario aprovado!');
      fetchComments();
    } catch {
      toast.error('Erro ao aprovar');
    }
  };

  const handleReject = async (commentId) => {
    try {
      await moderateComment(commentId, { status: 'REJECTED' });
      toast.success('Comentario reprovado!');
      fetchComments();
    } catch {
      toast.error('Erro ao reprovar');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(deleteId);
      toast.success('Comentario excluido!');
      setDeleteId(null);
      fetchComments();
    } catch {
      toast.error('Erro ao excluir comentario');
    }
  };

  // Contar por status (incluindo replies)
  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };
  comments.forEach((c) => {
    counts.all++;
    counts[getStatus(c)]++;
    (c.replies || []).forEach((r) => {
      counts.all++;
      counts[getStatus(r)]++;
    });
  });

  // Filtrar comentarios
  const filtered = filter === 'all'
    ? comments
    : comments.filter((c) => {
        const match = getStatus(c) === filter;
        const hasMatchingReply = (c.replies || []).some((r) => getStatus(r) === filter);
        return match || hasMatchingReply;
      });

  const TABS = [
    { value: 'all', label: 'Todos', count: counts.all },
    { value: 'pending', label: 'Pendentes', count: counts.pending },
    { value: 'approved', label: 'Aprovados', count: counts.approved },
    { value: 'rejected', label: 'Reprovados', count: counts.rejected },
  ];

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para aulas
      </button>

      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Comentarios da Aula</h1>

      {/* Tabs de filtro */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum comentario encontrado" />
      ) : (
        <div className="space-y-4">
          {filtered.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-xl shadow-sm border p-5 ${
                getStatus(comment) === 'pending' ? 'border-yellow-200' : getStatus(comment) === 'rejected' ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              {/* Comentario principal */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{comment.userName || 'Usuario'}</span>
                      <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      <CommentStatusBadge comment={comment} />
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</p>
                  </div>
                </div>
                <CommentActions
                  id={comment.id}
                  comment={comment}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={setDeleteId}
                />
              </div>

              {/* Respostas */}
              {comment.replies?.length > 0 && (
                <div className="mt-4 ml-11 space-y-3 border-l-2 border-gray-100 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <CornerDownRight className="h-3.5 w-3.5 text-gray-300 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">{reply.userName || 'Usuario'}</span>
                            <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                            <CommentStatusBadge comment={reply} />
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{reply.content}</p>
                        </div>
                      </div>
                      <CommentActions
                        id={reply.id}
                        comment={reply}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDelete={setDeleteId}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir comentario"
        message="Tem certeza que deseja excluir este comentario? Esta acao nao pode ser desfeita."
      />
    </div>
  );
}
