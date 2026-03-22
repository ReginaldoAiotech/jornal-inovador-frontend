import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, User, CornerDownRight, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getArticleComments, createArticleComment, replyArticleComment } from '../../services/articleService';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import { formatRelativeDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ArticleCommentSection({ articleId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = () => {
    setLoadingComments(true);
    getArticleComments(articleId)
      .then((res) => {
        const d = res?.data?.data || res?.data || res || [];
        setComments(Array.isArray(d) ? d : []);
      })
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  };

  useEffect(() => { fetchComments(); }, [articleId]);

  const isApproved = (c) => c.status?.toUpperCase() === 'APPROVED' || c.approved === true;
  const isPendingOrRejected = (c) => !isApproved(c) && c.status !== undefined;
  const visibleComments = comments.filter((c) => {
    if (isPendingOrRejected(c)) return c.userId === user?.id;
    return true;
  });

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await createArticleComment(articleId, { content: newComment.trim() });
      toast.success('Comentario enviado! Aguarde aprovacao do administrador.');
      setNewComment('');
      fetchComments();
    } catch {
      toast.error('Erro ao enviar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyTo) return;
    setSubmitting(true);
    try {
      await replyArticleComment(replyTo, { content: replyText.trim() });
      toast.success('Resposta enviada! Aguarde aprovacao do administrador.');
      setReplyText('');
      setReplyTo(null);
      fetchComments();
    } catch {
      toast.error('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">
          Comentarios ({visibleComments.length})
        </h2>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentario..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" size="sm" disabled={!newComment.trim() || submitting} isLoading={submitting}>
                  <Send className="h-3.5 w-3.5" /> Enviar
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 text-center mb-8">
          <Link to="/entrar" className="text-primary-500 font-medium hover:underline">Entre na sua conta</Link> para comentar.
        </div>
      )}

      {loadingComments ? (
        <Spinner className="py-8" />
      ) : visibleComments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Nenhum comentario ainda. Seja o primeiro!</p>
      ) : (
        <div className="space-y-5">
          {visibleComments.map((comment) => {
            const isPending = comment.status?.toUpperCase() === 'PENDING' || (comment.status === undefined && comment.approved == null);

            return (
              <div key={comment.id} className={cn('rounded-xl p-4', isPending ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-100')}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{comment.userName || 'Usuario'}</span>
                      <span className="text-xs text-gray-400">{formatRelativeDate(comment.createdAt)}</span>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Aguardando aprovacao
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{comment.content}</p>
                    {isAuthenticated && !isPending && (
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-xs text-gray-400 hover:text-primary-500 mt-1.5 font-medium"
                      >
                        Responder
                      </button>
                    )}
                  </div>
                </div>

                {comment.replies?.filter((r) => {
                  if (r.approved === false) return r.userId === user?.id;
                  return true;
                }).map((reply) => {
                  const replyPending = reply.status?.toUpperCase() === 'PENDING' || reply.approved === false;
                  return (
                    <div key={reply.id} className={cn('flex items-start gap-2.5 ml-11 mt-3 pl-4 border-l-2', replyPending ? 'border-yellow-300' : 'border-gray-100')}>
                      <CornerDownRight className="h-3.5 w-3.5 text-gray-300 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">{reply.userName || 'Usuario'}</span>
                          <span className="text-xs text-gray-400">{formatRelativeDate(reply.createdAt)}</span>
                          {replyPending && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                              <Clock className="h-3 w-3" /> Aguardando aprovacao
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{reply.content}</p>
                      </div>
                    </div>
                  );
                })}

                {replyTo === comment.id && (
                  <form onSubmit={handleSubmitReply} className="ml-11 mt-3 pl-4 border-l-2 border-primary-200">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva uma resposta..."
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setReplyTo(null); setReplyText(''); }}>
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm" disabled={!replyText.trim() || submitting} isLoading={submitting}>
                        <Send className="h-3.5 w-3.5" /> Responder
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
