import React from 'react';
import { useKhutwa } from '../../hooks';
import SubscriptionModal from './SubscriptionModal.jsx';
import ReceiptViewerModal from './ReceiptViewerModal.jsx';
import StudentManageModal from './StudentManageModal.jsx';

export function ModalsManager() {
  const { dialogContent, setDialogContent } = useKhutwa();

  if (!dialogContent) return null;

  return (
    <dialog id="dlg" open>
      <button className="x" onClick={() => setDialogContent(null)} aria-label="إغلاق">✕</button>
      {dialogContent.type === 'vodafone_insta_pay' && (
        <SubscriptionModal dialogContent={dialogContent} />
      )}
      {dialogContent.type === 'view_receipt' && (
        <ReceiptViewerModal dialogContent={dialogContent} />
      )}
      {dialogContent.type === 'student' && (
        <StudentManageModal dialogContent={dialogContent} />
      )}
    </dialog>
  );
}

export default ModalsManager;
