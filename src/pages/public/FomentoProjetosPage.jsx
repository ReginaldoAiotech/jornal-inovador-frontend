import { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, FileImage, File as FileIcon, Calendar, Building2 } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getMyProjetos } from '../../services/projetoFomentoService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileInfo(tipo, nome) {
  const ext = nome?.split('.').pop()?.toUpperCase() || '';
  if (tipo?.includes('pdf')) return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' };
  if (tipo?.includes('spreadsheet') || tipo?.includes('excel') || tipo?.includes('csv')) return { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50', label: ext };
  if (tipo?.includes('image')) return { icon: FileImage, color: 'text-blue-500', bg: 'bg-blue-50', label: ext };
  if (tipo?.includes('word') || tipo?.includes('document')) return { icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', label: 'DOC' };
  if (tipo?.includes('presentation') || tipo?.includes('powerpoint')) return { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50', label: 'PPT' };
  return { icon: FileIcon, color: 'text-gray-500', bg: 'bg-gray-50', label: ext };
}

export default function FomentoProjetosPage() {
  useDocumentTitle('Projetos');
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyProjetos()
      .then((data) => setProjetos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold font-heading text-gray-900">Projetos e Templates</h1>
        <p className="text-sm text-gray-500 mt-0.5">Documentos e modelos para auxiliar na submissao de editais</p>
      </div>

      {projetos.length === 0 ? (
        <EmptyState
          title="Nenhum documento disponivel"
          description="Em breve serao adicionados templates e modelos para auxiliar na submissao de editais."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projetos.map((p) => {
            const info = getFileInfo(p.tipoArquivo, p.nomeArquivo);
            const Icon = info.icon;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                {/* Top color bar */}
                <div className={`h-1.5 w-full ${p.tipoArquivo?.includes('pdf') ? 'bg-red-400' : p.tipoArquivo?.includes('word') ? 'bg-blue-500' : p.tipoArquivo?.includes('spreadsheet') || p.tipoArquivo?.includes('excel') ? 'bg-emerald-500' : 'bg-primary-400'}`} />

                <div className="p-5">
                  {/* File icon + extension badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${info.bg} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${info.color}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${info.bg} ${info.color}`}>
                      {info.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-gray-900 text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {p.titulo}
                  </h3>

                  {/* Description */}
                  {p.descricao && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{p.descricao}</p>
                  )}

                  {/* Edital vinculado */}
                  {p.editalFap && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-primary-600 font-medium">{p.editalFap}</span>
                      {p.editalTitulo && (
                        <span className="text-xs text-gray-400 truncate">— {p.editalTitulo}</span>
                      )}
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span>{formatFileSize(p.tamanhoBytes)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Download button */}
                  <a
                    href={p.urlArquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 text-gray-700 hover:text-primary-600 text-sm font-semibold rounded-xl transition-all"
                  >
                    <Download className="h-4 w-4" /> Baixar documento
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
