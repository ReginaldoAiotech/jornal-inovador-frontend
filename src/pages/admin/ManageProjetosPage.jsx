import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, ExternalLink, Paperclip, X, FileText, FileSpreadsheet, FileImage, File as FileIcon, Pencil, RefreshCw } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getMyProjetos, uploadProjeto, deleteProjeto, updateProjeto } from '../../services/projetoFomentoService';
import { getEditaisFomento } from '../../services/editalFomentoService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(tipo) {
  if (tipo?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (tipo?.includes('spreadsheet') || tipo?.includes('excel')) return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
  if (tipo?.includes('image')) return <FileImage className="h-4 w-4 text-blue-500" />;
  if (tipo?.includes('word') || tipo?.includes('document')) return <FileText className="h-4 w-4 text-blue-700" />;
  return <FileIcon className="h-4 w-4 text-gray-500" />;
}

export default function ManageProjetosPage() {
  useDocumentTitle('Gerenciar Projetos');
  const [projetos, setProjetos] = useState([]);
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Upload form
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [editalId, setEditalId] = useState('');
  const fileInputRef = useRef(null);

  // Edit form
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editEditalId, setEditEditalId] = useState('');
  const [editFile, setEditFile] = useState(null);
  const editFileRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([getMyProjetos(), getEditaisFomento({ limit: 200 })])
      .then(([projResult, editaisResult]) => {
        if (projResult.status === 'fulfilled') setProjetos(Array.isArray(projResult.value) ? projResult.value : []);
        if (editaisResult.status === 'fulfilled') {
          const data = editaisResult.value?.data || editaisResult.value || [];
          setEditais(Array.isArray(data) ? data : []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Upload handlers
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); if (!titulo) setTitulo(f.name.replace(/\.[^/.]+$/, '')); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); if (!titulo) setTitulo(f.name.replace(/\.[^/.]+$/, '')); }
  };

  const handleUpload = async () => {
    if (!file || !titulo.trim()) { toast.error('Selecione um arquivo e informe o titulo'); return; }
    setUploading(true);
    try {
      const novo = await uploadProjeto(file, titulo.trim(), descricao.trim(), editalId || undefined);
      setProjetos((prev) => [novo, ...prev]);
      toast.success('Documento enviado com sucesso!');
      resetUploadForm();
    } catch (err) {
      toast.error(err.message || 'Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => { setShowUpload(false); setFile(null); setTitulo(''); setDescricao(''); setEditalId(''); };

  // Edit handlers
  const openEdit = (p) => {
    setEditItem(p);
    setEditTitulo(p.titulo);
    setEditDescricao(p.descricao || '');
    setEditEditalId(p.editalDetalhesId || '');
    setEditFile(null);
  };

  const handleSaveEdit = async () => {
    if (!editTitulo.trim()) { toast.error('Titulo e obrigatorio'); return; }
    setSaving(true);
    try {
      const updated = await updateProjeto(editItem.id, {
        titulo: editTitulo.trim(),
        descricao: editDescricao.trim(),
        editalDetalhesId: editEditalId,
        arquivo: editFile || undefined,
      });
      setProjetos((prev) => prev.map((p) => (p.id === editItem.id ? updated : p)));
      toast.success(editFile ? 'Documento atualizado e arquivo substituido!' : 'Documento atualizado!');
      setEditItem(null);
    } catch (err) {
      toast.error(err.message || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProjeto(deleteId);
      setProjetos((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Documento removido');
    } catch { toast.error('Erro ao remover'); }
    finally { setDeleteId(null); }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-heading text-gray-900">Gerenciar Projetos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projetos.length} documento{projetos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Upload className="h-4 w-4" /> Enviar documento
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Enviar documento</h2>
            <button onClick={resetUploadForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors mb-4">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt,.csv" />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {getFileIcon(file.type)}
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-gray-400 hover:text-red-500 ml-2"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <>
                <Paperclip className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Arraste ou <span className="text-primary-500 font-medium">clique para selecionar</span></p>
                <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, imagem ou texto (max 20MB)</p>
              </>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titulo *</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nome do documento"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descricao</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descricao breve (opcional)" rows={2}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vincular a edital (opcional)</label>
              <select value={editalId} onChange={(e) => setEditalId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Nenhum edital vinculado</option>
                {editais.map((ed) => <option key={ed.id} value={ed.id}>{ed.fap ? `[${ed.fap}] ` : ''}{ed.tituloChamada?.substring(0, 80)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={resetUploadForm} className="px-4 py-2 text-sm font-medium text-gray-600">Cancelar</button>
            <button onClick={handleUpload} disabled={uploading || !file || !titulo.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors">
              {uploading ? <Spinner size="sm" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {projetos.length === 0 ? (
        <EmptyState title="Nenhum documento" description="Envie templates e documentos para os usuarios." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Documento</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Edital</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tamanho</th>
                <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Data</th>
                <th className="text-right py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(p.tipoArquivo)}
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[250px]">{p.titulo}</p>
                        <p className="text-xs text-gray-400">{p.nomeArquivo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {p.editalFap ? <span className="text-xs text-primary-600 font-medium">{p.editalFap}</span> : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{formatFileSize(p.tamanhoBytes)}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-accent-600 hover:bg-accent-50 transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <a href={p.urlArquivo} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 transition-colors" title="Abrir">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <Modal isOpen onClose={() => setEditItem(null)} title="Editar documento">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titulo *</label>
              <input type="text" value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descricao</label>
              <textarea value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} rows={2}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vincular a edital</label>
              <select value={editEditalId} onChange={(e) => setEditEditalId(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">Nenhum edital vinculado</option>
                {editais.map((ed) => <option key={ed.id} value={ed.id}>{ed.fap ? `[${ed.fap}] ` : ''}{ed.tituloChamada?.substring(0, 80)}</option>)}
              </select>
            </div>

            {/* Replace file */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Substituir arquivo</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
                  {editFile ? (
                    <>
                      {getFileIcon(editFile.type)}
                      <span className="truncate">{editFile.name}</span>
                      <span className="text-xs text-gray-400">({formatFileSize(editFile.size)})</span>
                      <button onClick={() => setEditFile(null)} className="text-gray-400 hover:text-red-500 ml-auto shrink-0"><X className="h-3.5 w-3.5" /></button>
                    </>
                  ) : (
                    <>
                      {getFileIcon(editItem.tipoArquivo)}
                      <span className="truncate">{editItem.nomeArquivo}</span>
                      <span className="text-xs text-gray-400">({formatFileSize(editItem.tamanhoBytes)})</span>
                    </>
                  )}
                </div>
                <button onClick={() => editFileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
                  <RefreshCw className="h-3.5 w-3.5" /> Trocar
                </button>
                <input ref={editFileRef} type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setEditFile(e.target.files[0]); }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt,.csv" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setEditItem(null)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancelar</button>
            <button onClick={handleSaveEdit} disabled={saving || !editTitulo.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? <Spinner size="sm" /> : <Pencil className="h-4 w-4" />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <Modal isOpen onClose={() => setDeleteId(null)} title="Excluir documento">
          <p className="text-sm text-gray-600 mb-4">Tem certeza que deseja excluir este documento?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancelar</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors">Excluir</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
