import React, { useEffect } from 'react';
import { useKhutwa } from '../../hooks';
import SubscriptionModal from './SubscriptionModal.jsx';
import ReceiptViewerModal from './ReceiptViewerModal.jsx';
import StudentManageModal from './StudentManageModal.jsx';
import TopupModal from './TopupModal.jsx';

export function ModalsManager() {
  const { dialogContent, setDialogContent } = useKhutwa();

  useEffect(() => {
    if (!dialogContent) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDialogContent(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogContent, setDialogContent]);

  if (!dialogContent) return null;

  return (
    <div className="modal-overlay" onClick={() => setDialogContent(null)}>
      <dialog
        id="dlg"
        className="modal-box"
        open
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
      >
        <button className="x" onClick={() => setDialogContent(null)} aria-label="إغلاق">
          <i className="fa-solid fa-xmark"></i>
        </button>
        {dialogContent.type === 'vodafone_insta_pay' && (
          <SubscriptionModal dialogContent={dialogContent} />
        )}
        {dialogContent.type === 'topup_balance' && (
          <TopupModal dialogContent={dialogContent} />
        )}
        {dialogContent.type === 'view_receipt' && (
          <ReceiptViewerModal dialogContent={dialogContent} />
        )}
        {dialogContent.type === 'student' && (
          <StudentManageModal dialogContent={dialogContent} />
        )}
      </dialog>
    </div>
  );
}

export default ModalsManager;
