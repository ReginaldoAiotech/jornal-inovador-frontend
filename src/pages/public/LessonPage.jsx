import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Lock, ChevronDown, ChevronUp, Send, User, CornerDownRight, Clock, MessageSquare, CheckCircle, Circle } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById, getLessonById, getComments, createComment, replyComment, getCourseProgress, markLessonComplete, unmarkLessonComplete } from '../../services/courseService';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { formatRelativeDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

function extractCompletedIds(progressRes) {
  if (!progressRes) return [];
  const d = progressRes?.data || progressRes;
  // Tentar varios formatos possiveis da API
  if (Array.isArray(d?.completedLessonIds)) return d.completedLessonIds;
  if (Array.isArray(d?.completedLessons)) return d.completedLessons.map((l) => l.id || l);
  if (Array.isArray(d)) return d.map((l) => l.lessonId || l.id || l);
  return [];
}

function ProgressBar({ completed, total }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-500">Progresso</span>
        <span className="text-xs font-bold text-primary-600">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{completed} de {total} aula{total !== 1 ? 's' : ''}</p>
    </div>
  );
}

function LessonSidebar({ course, courseId, currentLessonId, completedLessons }) {
  const modules = course?.modules || [];
  const [openModules, setOpenModules] = useState(() => {
    const initial = {};
    modules.forEach((m) => {
      if (m.lessons?.some((l) => l.id === currentLessonId)) initial[m.id] = true;
    });
    return initial;
  });

  const toggleModule = (id) => setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  const getLessonIcon = (lesson) => {
    if (completedLessons.has(lesson.id)) return <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />;
    if (lesson.isFree) return <Play className="h-3.5 w-3.5 shrink-0" />;
    return <Lock className="h-3.5 w-3.5 shrink-0 text-gray-300" />;
  };

  const allLessons = modules.flatMap((m) => m.lessons || []);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedLessons.has(l.id)).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <Link to={`/cursos/${courseId}`} className="text-sm font-semibold text-gray-900 hover:text-primary-500 line-clamp-1">
          {course?.title}
        </Link>
      </div>
      {completedCount > 0 && <ProgressBar completed={completedCount} total={totalLessons} />}
      <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
        {modules.sort((a, b) => (a.order || 0) - (b.order || 0)).map((mod) => (
          <div key={mod.id}>
            <button
              onClick={() => toggleModule(mod.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span className="truncate">{mod.title}</span>
              {openModules[mod.id] ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
            </button>
            {openModules[mod.id] && (mod.lessons || []).map((lesson) => (
              <Link
                key={lesson.id}
                to={`/cursos/${courseId}/aulas/${lesson.id}`}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 text-sm transition-colors',
                  lesson.id === currentLessonId
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                {getLessonIcon(lesson)}
                <span className="truncate">{lesson.title}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentSection({ lessonId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = () => {
    setLoadingComments(true);
    getComments(lessonId)
      .then((res) => {
        const d = res?.data?.data || res?.data || res || [];
        setComments(Array.isArray(d) ? d : []);
      })
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  };

  useEffect(() => { fetchComments(); }, [lessonId]);

  // Filtrar comentarios: aprovados para todos, pendentes/rejeitados so para o autor
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
      await createComment(lessonId, { content: newComment.trim() });
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
      await replyComment(replyTo, { content: replyText.trim() });
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

      {/* Formulario novo comentario */}
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

      {/* Lista de comentarios */}
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
                {/* Comentario principal */}
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

                {/* Respostas */}
                {comment.replies?.filter((r) => {
                  if (r.approved === false) return r.userId === user?.id;
                  return true;
                }).map((reply) => {
                  const replyPending = reply.approved === false;
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

                {/* Formulario de resposta */}
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

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [togglingComplete, setTogglingComplete] = useState(false);

  const isCompleted = completedLessons.has(lessonId);

  // Buscar curso e progresso apenas quando courseId muda
  useEffect(() => {
    setLoadingCourse(true);
    const promises = [getCourseById(courseId)];
    if (isAuthenticated) promises.push(getCourseProgress(courseId).catch(() => null));

    Promise.all(promises)
      .then(([courseRes, progressRes]) => {
        const c = courseRes?.data || courseRes;
        setCourse(c);
        if (progressRes) {
          setCompletedLessons(new Set(extractCompletedIds(progressRes)));
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoadingCourse(false));
  }, [courseId, isAuthenticated]);

  // Buscar aula quando lessonId ou course muda
  useEffect(() => {
    if (!course) return;
    setLoadingLesson(true);
    setLesson(null);

    for (const mod of course.modules || []) {
      const found = (mod.lessons || []).find((l) => l.id === lessonId);
      if (found) {
        if (found.content || found.videoUrl) {
          setLesson(found);
          setLoadingLesson(false);
        } else {
          getLessonById(courseId, mod.id, lessonId)
            .then((lRes) => setLesson(lRes?.data || lRes))
            .catch(() => setLesson(found))
            .finally(() => setLoadingLesson(false));
        }
        return;
      }
    }
    setLesson(null);
    setLoadingLesson(false);
  }, [course, lessonId, courseId]);

  const handleToggleComplete = async () => {
    setTogglingComplete(true);
    const prev = new Set(completedLessons);
    try {
      if (isCompleted) {
        setCompletedLessons((s) => { const n = new Set(s); n.delete(lessonId); return n; });
        await unmarkLessonComplete(lessonId);
        toast.success('Aula desmarcada');
      } else {
        setCompletedLessons((s) => new Set(s).add(lessonId));
        await markLessonComplete(lessonId);
        toast.success('Aula concluida!');
      }
    } catch {
      setCompletedLessons(prev);
      toast.error('Erro ao atualizar progresso');
    } finally {
      setTogglingComplete(false);
    }
  };

  useDocumentTitle(lesson?.title || 'Aula');

  if (loadingCourse) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to={`/cursos/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar para o curso
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conteudo principal */}
        <div className="lg:col-span-3">
          {loadingLesson ? (
            <Spinner className="py-20" />
          ) : (
            <>
              {/* Video */}
              {lesson?.videoUrl && (
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video">
                  {lesson.videoUrl.includes('iframe.mediadelivery.net') || lesson.videoUrl.includes('/embed/') ? (
                    <iframe
                      src={lesson.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />
                  ) : (
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="w-full h-full"
                      controlsList="nodownload"
                    />
                  )}
                </div>
              )}

              <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">{lesson?.title || 'Aula nao encontrada'}</h1>

              {lesson && isAuthenticated && (
                <button
                  onClick={handleToggleComplete}
                  disabled={togglingComplete}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-200 mb-4 w-full sm:w-auto justify-center',
                    isCompleted
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  )}
                >
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  {isCompleted ? 'Aula concluida' : 'Marcar como concluida'}
                </button>
              )}
              {lesson?.description && (
                <p className="text-gray-500 mb-4">{lesson.description}</p>
              )}

              {lesson?.isFree && <Badge variant="success" className="mb-4">Aula gratuita</Badge>}

              {/* Conteudo HTML */}
              {lesson?.content && (
                <div
                  className="prose prose-sm max-w-none text-gray-700 mt-6"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              )}

              {!lesson && (
                <div className="text-center py-20 text-gray-400">
                  Aula nao encontrada ou voce nao tem acesso.
                </div>
              )}

              {/* Comentarios */}
              {lesson && <CommentSection lessonId={lessonId} />}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <LessonSidebar course={course} courseId={courseId} currentLessonId={lessonId} completedLessons={completedLessons} />
          </div>
        </div>
      </div>
    </div>
  );
}
