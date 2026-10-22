import React from 'react';

export function ReceiptViewerModal({ dialogContent }) {
  if (!dialogContent || dialogContent.type !== 'view_receipt') return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>إيصال التحويل: {dialogContent.req.userName}</h2>
      <p className="hint" style={{ marginBottom: '14px' }}>
        الكورس: <b>{dialogContent.req.courseTitle}</b> · المبلغ: <b>{dialogContent.req.price} ج.م</b> · المحول منه: <b>{dialogContent.req.sender}</b>
      </p>
      <div style={{ maxHeight: '70vh', overflow: 'auto', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <img
          src={dialogContent.img}
          alt="إيصال التحويل بالكامل"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </div>
  );
}

export default ReceiptViewerModal;
