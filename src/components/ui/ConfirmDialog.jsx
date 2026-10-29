import Modal from './Modal';
import { useI18n } from '../../i18n/useI18n';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onCancel} title={title} labelledBy="confirm-dialog-title">
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-outline" type="button" onClick={onCancel}>{t('common.cancel')}</button>
        <button className="btn btn-danger" type="button" onClick={onConfirm}>{t('modal.confirm')}</button>
      </div>
    </Modal>
  );
}
