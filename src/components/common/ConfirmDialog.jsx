import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title = 'Confirmar', message = 'Tem certeza que deseja continuar?' }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm}>Confirmar</Button>
      </div>
    </Modal>
  );
}
