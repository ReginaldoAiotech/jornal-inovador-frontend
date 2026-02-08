import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';

const ROLE_LABELS = { USER: 'Usuario', EDITOR: 'Editor', ADMIN: 'Administrador' };
const ROLE_VARIANTS = { USER: 'info', EDITOR: 'warning', ADMIN: 'danger' };

export default function ProfilePage() {
  useDocumentTitle('Perfil');
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Meu Perfil</h1>
      <Card>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Nome</p>
            <p className="text-lg font-medium text-gray-900">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">E-mail</p>
            <p className="text-gray-700">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Funcao</p>
            <Badge variant={ROLE_VARIANTS[user?.role] || 'default'}>
              {ROLE_LABELS[user?.role] || user?.role}
            </Badge>
          </div>
          {user?.createdAt && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Membro desde</p>
              <p className="text-gray-700">{formatDate(user.createdAt)}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
