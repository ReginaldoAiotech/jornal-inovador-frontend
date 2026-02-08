import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getUsers, updateUser, deleteUser } from '../../services/userService';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
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
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');

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
    { key: 'name', label: 'Nome', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Funcao', render: (row) => <Badge variant={ROLE_VARIANTS[row.role]}>{ROLE_LABELS[row.role]}</Badge> },
    { key: 'createdAt', label: 'Cadastro', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditUser(row); setEditRole(row.role); }} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Usuarios</h1>
      <DataTable columns={columns} data={users} isLoading={loading} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir usuario"
        message="Tem certeza que deseja excluir este usuario? Esta acao nao pode ser desfeita."
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
