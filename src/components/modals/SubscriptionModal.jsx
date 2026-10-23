import React, { useState } from 'react';
import { useKhutwa } from '../../hooks';
import { gid } from '../../utils';

export function SubscriptionModal({ dialogContent }) {
  const { user, db, saveDb, showToast, setDialogContent, copyToClipboard } = useKhutwa();

  const [payMethod, setPayMethod] = useState('vodafone');
  const [paySender, setPaySender] = useState(user?.phone || '');
  const [payReceipt, setPayReceipt] = useState('');
  const [payNotes, setPayNotes] = useState('');

  if (!dialogContent || dialogContent.type !== 'vodafone_insta_pay') return null;

  return (
    <div>
      <h2>الاشتراك في: {dialogContent.course.title}</h2>
      <p className="mt" style={{ marginBottom: '16px' }}>
        <span>المبلغ المطلوب: <b>{dialogContent.course.price} ج.م</b></span>
      </p>

      {/* Payment Method Selector */}
      <div className="opts" style={{ marginBottom: '16px' }}>
        <label>
          <input
            type="radio"
            name="method"
            value="vodafone"
            checked={payMethod === 'vodafone'}
            onChange={() => setPayMethod('vodafone')}
          />
          <span>فودافون كاش / محفظة إلكترونية</span>
        </label>
        <label>
          <input
            type="radio"
            name="method"
            value="instapay"
            checked={payMethod === 'instapay'}
            onChange={() => setPayMethod('instapay')}
          />
          <span>إنستاباي InstaPay</span>
        </label>
      </div>

      {/* Transfer Details Card */}
      <div style={{ background: 'var(--line)', padding: '14px 18px', borderRadius: '12px', marginBottom: '18px' }}>
        {payMethod === 'vodafone' ? (
          <div>
            <span className="hint" style={{ display: 'block', marginBottom: '6px' }}>
              رقم تحويل فودافون كاش أو أي محفظة (أورنج / اتصالات / وي كاش):
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.3rem', letterSpacing: '1px', color: 'var(--cyt)' }}>
                {db.settings.vodafone || '01028103634'}
              </strong>
              <button
                type="button"
                className="btn"
                style={{ padding: '6px 16px', fontSize: '.9rem' }}
                onClick={() => copyToClipboard(db.settings.vodafone || '01028103634', 'رقم فودافون كاش')}
              >
                نسخ الرقم
              </button>
            </div>
          </div>
        ) : (
          <div>
            <span className="hint" style={{ display: 'block', marginBottom: '6px' }}>
              معرف الدفع على تطبيق إنستاباي (InstaPay Address):
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.25rem', letterSpacing: '1px', color: 'var(--cyt)' }}>
                {db.settings.instapay || 'khutwa@instapay'}
              </strong>
              <button
                type="button"
                className="btn"
                style={{ padding: '6px 16px', fontSize: '.9rem' }}
                onClick={() => copyToClipboard(db.settings.instapay || 'khutwa@instapay', 'معرف إنستاباي')}
              >
                نسخ المعرف
              </button>
            </div>
          </div>
        )}
        <small className="hint" style={{ display: 'block', marginTop: '10px' }}>
          حوّل مبلغ <strong>{dialogContent.course.price} ج.م</strong> ثم ارفع صورة الإيصال واكتب الرقم المحول منه أدناه.
        </small>
      </div>

      {/* Payment Proof Form */}
      <form
        className="fm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!paySender.trim()) {
            showToast('يرجى إدخال الرقم المحول منه أو اسم الحساب');
            return;
          }
          if (!payReceipt) {
            showToast('يرجى رفع صورة إيصال التحويل');
            return;
          }

          const newSubReq = {
            id: gid('sub'),
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phone || '',
            courseId: dialogContent.course.id,
            courseTitle: dialogContent.course.title,
            price: dialogContent.course.price,
            method: payMethod,
            sender: paySender.trim(),
            receiptImg: payReceipt,
            notes: payNotes.trim(),
            status: 'pending',
            date: Date.now()
          };

          const nextRequests = [newSubReq, ...(db.subRequests || [])];
          saveDb({ ...db, subRequests: nextRequests });
          setDialogContent(null);
          showToast('تم إرسال إيصال التحويل بنجاح! سيتم مراجعة الطلب وتفعيل الكورس من الأدمن.');
        }}
      >
        <label>
          {payMethod === 'vodafone'
            ? 'الحساب اللي محول منه (رقم محفظة فودافون كاش) *'
            : 'الحساب اللي محول منه (اسم حسابك أو رقمك على إنستاباي) *'}
          <input
            className="fi"
            required
            placeholder={
              payMethod === 'vodafone'
                ? 'مثال: 010xxxxxxxx (رقم المحفظة)'
                : 'مثال: yourname@instapay أو رقم الهاتف المسجل'
            }
            value={paySender}
            onChange={(e) => setPaySender(e.target.value)}
          />
        </label>

        <label>
          صورة إيصال التحويل (Screenshot) *
          <input
            className="fi"
            type="file"
            accept="image/*"
            required={!payReceipt}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  setPayReceipt(reader.result);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>

        {payReceipt && (
          <div style={{ marginTop: '8px' }}>
            <span className="hint">معاينة الإيصال:</span>
            <img
              src={payReceipt}
              alt="معاينة الإيصال"
              style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '10px', marginTop: '6px', border: '2px solid var(--cyan)', display: 'block' }}
            />
          </div>
        )}

        <label>
          ملاحظات إضافية (اختياري)
          <input
            className="fi"
            placeholder="أي توضيح للأدمن بخصوص عملية التحويل"
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
          />
        </label>

        <button className="btn" type="submit" style={{ marginTop: '10px' }}>
          إرسال إيصال التحويل لتأكيد الاشتراك
        </button>
      </form>
    </div>
  );
}

export default SubscriptionModal;
