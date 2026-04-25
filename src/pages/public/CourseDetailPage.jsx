import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, BarChart3, ChevronDown, ChevronUp, Play, CheckCircle, GraduationCap } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById, getCourseProgress } from '../../services/courseService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';

const LEVEL_LABELS = { BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediario', ADVANCED: 'Avancado' };
const LEVEL_VARIANT = { BEGINNER: 'info', INTERMEDIATE: 'warning', ADVANCED: 'danger' };

function extractCompletedIds(progressRes) {
  if (!progressRes) return [];
  const d = progressRes?.data || progressRes;
  // Formato atual da API: { modules: [{ lessons: [{ lessonId, completed }] }] }
  if (Array.isArray(d?.modules)) {
    return d.modules.flatMap((m) =>
      (m.lessons || [])
        .filter((l) => l.completed)
        .map((l) => l.lessonId || l.id)
        .filter(Boolean),
    );
  }
  if (Array.isArray(d?.completedLessonIds)) return d.completedLessonIds;
  if (Array.isArray(d?.completedLessons)) return d.completedLessons.map((l) => l.id || l);
  if (Array.isArray(d)) return d.map((l) => l.lessonId || l.id || l);
  return [];
}

function ModuleAccordion({ module: mod, courseId, defaultOpen = false, completedLessons }) {
  const [open, setOpen] = useState(defaultOpen);
  const lessons = mod.lessons || [];
  const completedInModule = lessons.filter((l) => completedLessons.has(l.id)).length;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-primary-600 bg-primary-50 rounded-full w-7 h-7 flex items-center justify-center">
            {mod.order ?? '—'}
          </span>
          <span className="font-medium text-gray-900 text-left">{mod.title}</span>
          <span className="text-xs text-gray-400">
            {completedInModule > 0 ? `${completedInModule}/` : ''}{lessons.length} aula{lessons.length !== 1 ? 's' : ''}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && lessons.length > 0 && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.has(lesson.id);
            return (
              <Link
                key={lesson.id}
                to={`/cursos/${courseId}/aulas/${lesson.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-primary-50/50 transition-colors group"
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Play className="h-4 w-4 text-primary-500 shrink-0" />
                )}
                <span className="text-sm text-gray-700 group-hover:text-primary-600 flex-1">{lesson.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    const promises = [getCourseById(id)];
    if (isAuthenticated) promises.push(getCourseProgress(id).catch(() => null));

    Promise.all(promises)
      .then(([courseRes, progressRes]) => {
        setCourse(courseRes?.data || courseRes);
        if (progressRes) {
          setCompletedLessons(new Set(extractCompletedIds(progressRes)));
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  useDocumentTitle(course?.title || 'Curso');

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!course) return <div className="py-20 text-center text-gray-500">Curso nao encontrado</div>;

  const modules = course.modules || [];
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedCount = completedLessons.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const firstLesson = modules[0]?.lessons?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to={ROUTES.COURSES} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar para cursos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info principal */}
        <div className="lg:col-span-2">
          {course.coverImageUrl && (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
          )}
          <h1 className="text-3xl font-bold font-heading text-gray-900 mb-3">{course.title}</h1>
          {course.shortDescription && (
            <p className="text-lg text-gray-600 mb-4">{course.shortDescription}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {course.category && (
              <span className="text-sm font-medium text-primary-500 bg-primary-50 px-3 py-1 rounded-full">
                {course.category}
              </span>
            )}
            {course.level && (
              <Badge variant={LEVEL_VARIANT[course.level]}>{LEVEL_LABELS[course.level] || course.level}</Badge>
            )}
            {course.instructor && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{course.instructor}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <BarChart3 className="h-4 w-4" />
              <span>{modules.length} modulo{modules.length !== 1 ? 's' : ''} · {totalLessons} aula{totalLessons !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {course.description && (
            <div className="prose prose-sm max-w-none text-gray-700 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Sobre o curso</h2>
              <p className="whitespace-pre-line">{course.description}</p>
            </div>
          )}

          {/* Modulos */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conteudo do curso</h2>
          <div className="space-y-3">
            {modules.length > 0 ? (
              modules
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((mod, i) => (
                  <ModuleAccordion key={mod.id} module={mod} courseId={course.id} defaultOpen={i === 0} completedLessons={completedLessons} />
                ))
            ) : (
              <p className="text-sm text-gray-400">Nenhum modulo disponivel ainda.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Acesso liberado</p>
                <p className="text-xs text-gray-500">Conteudo gratuito</p>
              </div>
            </div>

            {firstLesson && (
              <Link
                to={`/cursos/${course.id}/aulas/${firstLesson.id}`}
                className="block w-full text-center py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors mb-3"
              >
                {completedCount > 0 ? 'Continuar curso' : 'Comecar curso'}
              </Link>
            )}

            {/* Barra de progresso */}
            {isAuthenticated && totalLessons > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Seu progresso</span>
                  <span className="text-sm font-bold text-primary-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{completedCount} de {totalLessons} aula{totalLessons !== 1 ? 's' : ''} concluida{totalLessons !== 1 ? 's' : ''}</p>
              </div>
            )}

            <div className="text-xs text-gray-400 text-center space-y-1 mt-4 pt-4 border-t border-gray-100">
              <p>{modules.length} modulo{modules.length !== 1 ? 's' : ''}</p>
              <p>{totalLessons} aula{totalLessons !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
