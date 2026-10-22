import React, { useState } from 'react';
import { useKhutwa } from '../../hooks';
import { gid } from '../../utils';

export function TopupModal({ dialogContent }) {
  const { user, db, saveDb, showToast, setDialogContent, copyToClipboard } = useKhutwa();

  const [amount, setAmount] = useState('500');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [payMethod, setPayMethod] = useState('vodafone');
  const [paySender, setPaySender] = useState(user?.phone || '');
  const [payReceipt, setPayReceipt] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!dialogContent || dialogContent.type !== 'topup_balance') return null;

  const currentAmount = isCustom ? (Number(customAmount) || 0) : Number(amount);

  const handleReceiptUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 4 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPayReceipt(reader.result);
      showToast('تم تحميل صورة الإيصال بنجاح');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentAmount < 10) {
      showToast('أقل مبلغ لشحن الرصيد هو 10 ج.م');
      return;
    }
    if (!paySender.trim()) {
      showToast('يرجى كتابة رقم الهاتف أو الحساب المحول منه');
      return;
    }

    setSubmitting(true);

    const newReq = {
      id: gid('top'),
      type: 'topup',
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || '',
      amount: currentAmount,
      price: currentAmount,
      courseTitle: `شحن رصيد محفظة (${currentAmount} ج.م)`,
      method: payMethod,
      sender: paySender.trim(),
      receiptImg: payReceipt,
      notes: payNotes.trim(),
      date: Date.now(),
      status: 'pending'
    };

    const nextSubRequests = [newReq, ...(db.subRequests || [])];
    saveDb({ ...db, subRequests: nextSubRequests });

    showToast(`تم إرسال طلب شحن رصيد بقيمة ${currentAmount} ج.م بنجاح! سيتم إيداعه في محفظتك فور مراجعته.`);
    setDialogContent(null);
  };

  const presetAmounts = ['100', '250', '500', '650', '1000'];

  return (
    <div className="topup-modal-content">
      <div className="topup-modal-header">
        <div className="topup-icon-wrap">
          <i className="fa-solid fa-wallet"></i>
        </div>
        <div>
          <h2>شحن رصيد المحفظة</h2>
          <p className="hint">
            حوّل المبلغ المطلوب عبر المحفظة الإلكترونية أو إنستاباي، وسيتم إيداع الرصيد في حسابك مباشرة بعد المراجعة.
          </p>
        </div>
      </div>

      {/* Preset Amount Selector */}
      <div className="topup-step-block">
        <label className="topup-step-label">
          <span className="step-num">1</span>
          اختر أو حدد المبلغ المراد شحنه:
        </label>
        <div className="topup-presets-grid">
          {presetAmounts.map((p) => (
            <button
              type="button"
              key={p}
              className={`topup-preset-btn ${!isCustom && amount === p ? 'active' : ''}`}
              onClick={() => {
                setAmount(p);
                setIsCustom(false);
              }}
            >
              <b>{p}</b>
              <small>ج.م</small>
            </button>
          ))}
          <button
            type="button"
            className={`topup-preset-btn ${isCustom ? 'active' : ''}`}
            onClick={() => setIsCustom(true)}
          >
            <b>مبلغ آخر</b>
          </button>
        </div>

        {isCustom && (
          <div className="topup-custom-input-wrap">
            <input
              type="number"
              className="fi"
              placeholder="اكتب المبلغ بالجنيه (مثال: 350)"
              min="10"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              required
              autoFocus
            />
            <span className="currency-tag">ج.م</span>
          </div>
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="topup-step-block">
        <label className="topup-step-label">
          <span className="step-num">2</span>
          طريقة التحويل الإلكتروني:
        </label>
        <div className="topup-methods-toggle">
          <button
            type="button"
            className={`topup-method-tab ${payMethod === 'vodafone' ? 'active' : ''}`}
            onClick={() => setPayMethod('vodafone')}
          >
            <i className="fa-solid fa-mobile-screen-button"></i>
            <span>فودافون كاش ومحافظ المحمول</span>
          </button>
          <button
            type="button"
            className={`topup-method-tab ${payMethod === 'instapay' ? 'active' : ''}`}
            onClick={() => setPayMethod('instapay')}
          >
            <i className="fa-solid fa-bolt"></i>
            <span>إنستاباي InstaPay</span>
          </button>
        </div>

        {/* Transfer details display */}
        <div className="topup-transfer-info-card">
          {payMethod === 'vodafone' ? (
            <div className="transfer-data-row">
              <div>
                <span className="transfer-hint">رقم محفظة التحويل (فودافون / أورنج / اتصالات / وي كاش):</span>
                <strong className="transfer-number">{db.settings?.vodafone || '01012345678'}</strong>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => copyToClipboard(db.settings?.vodafone || '01012345678', 'رقم فودافون كاش')}
              >
                <i className="fa-regular fa-copy"></i>
                نسخ الرقم
              </button>
            </div>
          ) : (
            <div className="transfer-data-row">
              <div>
                <span className="transfer-hint">عنوان الدفع المعتمد لتطبيق إنستاباي (IPA):</span>
                <strong className="transfer-number">{db.settings?.instapay || 'khutwa@instapay'}</strong>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => copyToClipboard(db.settings?.instapay || 'khutwa@instapay', 'معرف إنستاباي')}
              >
                <i className="fa-regular fa-copy"></i>
                نسخ المعرف
              </button>
            </div>
          )}

          <div className="topup-amount-summary">
            <span>المبلغ المطلوب تحويله:</span>
            <strong>{currentAmount || 0} ج.م</strong>
          </div>
        </div>
      </div>

      {/* Confirmation Form */}
      <form onSubmit={handleSubmit} className="topup-form">
        <label className="topup-step-label">
          <span className="step-num">3</span>
          بيانات وإيصال التحويل:
        </label>

        <div className="fi-group">
          <label className="fi-label">الرقم أو الحساب الذي قمت بالتحويل منه:</label>
          <input
            type="text"
            className="fi"
            placeholder={payMethod === 'vodafone' ? 'مثال: 01012345678' : 'اسم حسابك في إنستاباي أو رقم هاتفك'}
            value={paySender}
            onChange={(e) => setPaySender(e.target.value)}
            required
          />
        </div>

        <div className="fi-group">
          <label className="fi-label">إرفاق صورة إيصال التحويل / لقطة الشاشة (اختياري لكن يسرع التأكيد):</label>
          <input
            type="file"
            accept="image/*"
            className="fi fi-file"
            onChange={handleReceiptUpload}
          />
          {payReceipt && (
            <div className="receipt-preview-pill">
              <i className="fa-solid fa-circle-check" style={{ color: 'var(--cyan)' }}></i>
              <span>تم تجهيز صورة الإيصال للإرسال</span>
            </div>
          )}
        </div>

        <div className="fi-group">
          <label className="fi-label">ملاحظات إضافية (اختياري):</label>
          <input
            type="text"
            className="fi"
            placeholder="أي تفاصيل أو رقم مرجعي للعملية..."
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
          />
        </div>

        <div className="topup-actions">
          <button
            type="submit"
            className="btn btn-primary topup-submit-btn"
            disabled={submitting || currentAmount < 10}
          >
            <i className="fa-solid fa-paper-plane"></i>
            تأكيد وإرسال طلب الشحن ({currentAmount || 0} ج.م)
          </button>
          <button
            type="button"
            className="lnk topup-cancel-btn"
            onClick={() => setDialogContent(null)}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default TopupModal;
