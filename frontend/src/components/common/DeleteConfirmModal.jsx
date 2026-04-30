import { Modal, Button, Spinner } from 'react-bootstrap';
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteConfirmModal = ({ show, onHide, onConfirm, loading = false, title = 'Delete', message = 'Are you sure you want to delete this item? This action cannot be undone.' }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Body style={{ background: 'var(--bg-card)', padding: '32px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--danger-bg)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <FiAlertTriangle size={28} style={{ color: 'var(--danger)' }} />
        </div>
        <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h5>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
        <div className="d-flex gap-3 justify-content-center">
          <Button
            variant="light"
            onClick={onHide}
            disabled={loading}
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
              padding: '10px 28px', fontWeight: 500, minWidth: '100px',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: 'var(--danger)', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '10px 28px',
              fontWeight: 600, minWidth: '100px',
            }}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteConfirmModal;
