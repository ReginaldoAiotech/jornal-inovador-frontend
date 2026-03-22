import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, User, CheckCircle, XCircle, Clock, CornerDownRight } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getPendingArticleComments, moderateArticleComment, deleteArticleComment } from '../../services/articleService';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { formatRelativeDate } from '../../utils/formatters';

export default function PendingArticleCommentsPage() {
  useDocumentTitle('Comentarios de Artigos');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchComments = () => {
    setLoading(true);
    getPendingArticleComments()
      .then((res) => {
        const d = res?.data?.data || res?.data || res || [];
        setComments(Array.isArray(d) ? d : []);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, []);

  const handleApprove = async (commentId) => {
    try {
      await moderateArticleComment(commentId, { status: 'APPROVED' });
      toast.success('Comentario aprovado!');
      fetchComments();
    } catch {
      toast.error('Erro ao aprovar');
    }
  };

  const handleReject = async (commentId) => {
    try {
      await moderateArticleComment(commentId, { status: 'REJECTED' });
      toast.success('Comentario reprovado!');
      fetchComments();
    } catch {
      toast.error('Erro ao reprovar');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArticleComment(deleteId);
      toast.success('Comentario excluido!');
      setDeleteId(null);
      fetchComments();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Comentarios de Artigos</h1>
          <p className="text-sm text-gray-500 mt-1">{comments.length} comentario{comments.length !== 1 ? 's' : ''} aguardando moderacao</p>
        </div>
      </div>

      {comments.length === 0 ? (
        <EmptyState title="Nenhum comentario pendente" />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-yellow-200 p-5">
              {comment.articleTitle && (
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <span className="text-xs text-gray-400">Artigo:</span>{' '}
                  <Link
                    to={`/artigos/${comment.articleId}`}
                    className="text-xs font-medium text-primary-500 hover:underline"
                  >
                    {comment.articleTitle}
                  </Link>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{comment.userName || 'Usuario'}</span>
                      <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                      <Badge variant="warning" className="inline-flex items-center gap-1 text-[10px]">
                        <Clock className="h-3 w-3" /> Pendente
                      </Badge>
                      {comment.parentId && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <CornerDownRight className="h-3 w-3" /> Resposta
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleApprove(comment.id)}
                    className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-500"
                    title="Aprovar"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReject(comment.id)}
                    className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600"
                    title="Reprovar"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(comment.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-500"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir comentario"
        message="Tem certeza que deseja excluir este comentario?"
      />
    </div>
  );
}
