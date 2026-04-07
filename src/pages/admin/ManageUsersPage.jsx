import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getUsers, updateUser, deleteUser, approveUser, rejectUser, suspendUser } from '../../services/userService';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Pencil, Trash2, CheckCircle, XCircle, Clock, UserCheck, Ban } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const ROLE_LABELS = { USER: 'Usuario', EDITOR: 'Editor', ADMIN: 'Admin' };
const ROLE_VARIANTS = { USER: 'info', EDITOR: 'warning', ADMIN: 'danger' };
const roleOptions = [
  { value: 'USER', label: 'Usuario' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'ADMIN', label: 'Administrador' },
];

export default function ManageUsersPage() {
  useDocumentTitle('Gerenciar Usuarios');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [suspendId, setSuspendId] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'pending' | 'approved'

  const fetchData = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        const data = res?.data || res || [];
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const pendingUsers = users.filter((u) => !u.isApproved && u.role !== 'ADMIN');
  const approvedUsers = users.filter((u) => u.isApproved || u.role === 'ADMIN');
  const displayUsers = tab === 'pending' ? pendingUsers : tab === 'approved' ? approvedUsers : users;

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      toast.success('Usuario aprovado!');
      fetchData();
    } catch {
      toast.error('Erro ao aprovar');
    }
  };

  const handleSuspend = async () => {
    try {
      await suspendUser(suspendId);
      toast.success('Acesso do usuario suspenso.');
      setSuspendId(null);
      fetchData();
    } catch {
      toast.error('Erro ao suspender');
    }
  };

  const handleReject = async () => {
    try {
      await rejectUser(rejectId);
      toast.success('Usuario rejeitado e removido.');
      setRejectId(null);
      fetchData();
    } catch {
      toast.error('Erro ao rejeitar');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      toast.success('Usuario excluido!');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateUser(editUser.id, { role: editRole });
      toast.success('Funcao atualizada!');
      setEditUser(null);
      fetchData();
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (row) => (
        <div>
          <span className="font-medium">{row.name}</span>
          {!row.isApproved && row.role !== 'ADMIN' && (
            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-yellow-50 text-yellow-600 rounded-full">
              <Clock className="h-2.5 w-2.5" /> Pendente
            </span>
          )}
        </div>
      ),
    },
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Funcao', render: (row) => <Badge variant={ROLE_VARIANTS[row.role]}>{ROLE_LABELS[row.role]}</Badge> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => row.isApproved || row.role === 'ADMIN' ? (
        <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3.5 w-3.5" /> Aprovado</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-yellow-600"><Clock className="h-3.5 w-3.5" /> Pendente</span>
      ),
    },
    { key: 'createdAt', label: 'Cadastro', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-1">
          {!row.isApproved && row.role !== 'ADMIN' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="p-1.5 rounded hover:bg-green-50 text-green-600"
                title="Aprovar"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => setRejectId(row.id)}
                className="p-1.5 rounded hover:bg-red-50 text-red-500"
                title="Rejeitar"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          {row.isApproved && row.role !== 'ADMIN' && (
            <button
              onClick={() => setSuspendId(row.id)}
              className="p-1.5 rounded hover:bg-orange-50 text-orange-500"
              title="Suspender acesso"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => { setEditUser(row); setEditRole(row.role); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Editar funcao">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Usuarios</h1>
        {pendingUsers.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">
            <UserCheck className="h-4 w-4" />
            {pendingUsers.length} pendente{pendingUsers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: `Todos (${users.length})` },
          { key: 'pending', label: `Pendentes (${pendingUsers.length})` },
          { key: 'approved', label: `Aprovados (${approvedUsers.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              tab === t.key
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={displayUsers} isLoading={loading} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir usuario"
        message="Tem certeza que deseja excluir este usuario? Esta acao nao pode ser desfeita."
      />

      <ConfirmDialog
        isOpen={!!rejectId}
        onConfirm={handleReject}
        onCancel={() => setRejectId(null)}
        title="Rejeitar cadastro"
        message="O usuario sera removido do sistema. Deseja continuar?"
      />

      <ConfirmDialog
        isOpen={!!suspendId}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendId(null)}
        title="Suspender acesso"
        message="O usuario nao podera mais acessar o sistema. Voce podera reativa-lo aprovando novamente. Deseja continuar?"
      />

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Editar funcao - ${editUser?.name}`}>
        <Select
          label="Funcao"
          value={editRole}
          onChange={(e) => setEditRole(e.target.value)}
          options={roleOptions}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setEditUser(null)}>Cancelar</Button>
          <Button onClick={handleUpdateRole}>Salvar</Button>
        </div>
      </Modal>
    </div>
  );
}
