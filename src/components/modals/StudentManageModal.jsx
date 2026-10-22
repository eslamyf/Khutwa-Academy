import React from 'react';
import { useKhutwa } from '../../hooks';
import { gid, fmt } from '../../utils';

export function StudentManageModal({ dialogContent }) {
  const { db, saveDb, showToast, setDialogContent, getCourse } = useKhutwa();

  if (!dialogContent || dialogContent.type !== 'student') return null;

  const stu = dialogContent.student;
  const stuEnr = db.enr.filter((e) => e.u === stu.id);

  return (
    <div>
      <h2>{stu.name}</h2>
      <p className="hint">{stu.email} · {stu.phone || '—'} · سجّل {fmt(stu.created)}</p>
      <h3>الرصيد: {stu.balance} ج.م</h3>
      <form
        className="lr"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const amount = Math.abs(+fd.get('amount'));
          const isAdd = fd.get('op') === 'add';
          if (!isAdd && amount > stu.balance) {
            showToast('الخصم أكبر من الرصيد');
            return;
          }
          stu.balance += isAdd ? amount : -amount;
          db.tx.unshift({
            id: gid('t'),
            u: stu.id,
            amount: isAdd ? amount : -amount,
            type: isAdd ? 'topup' : 'adjust',
            note: fd.get('note') || (isAdd ? 'شحن من الأدمن' : 'خصم من الأدمن'),
            date: Date.now()
          });
          saveDb({ ...db });
          showToast('تم تعديل الرصيد');
          setDialogContent(null);
        }}
      >
        <select className="fi" name="op">
          <option value="add">شحن (+)</option>
          <option value="sub">خصم (−)</option>
        </select>
        <input className="fi" name="amount" type="number" min="1" required placeholder="المبلغ" />
        <input className="fi" name="note" placeholder="ملاحظة" />
        <button className="btn" type="submit">تنفيذ</button>
      </form>

      <h3 style={{ marginTop: '16px' }}>الاشتراكات</h3>
      {stuEnr.map((e) => (
        <div key={e.c} className="lr">
          <span>{getCourse(e.c)?.title || 'محذوف'} · {e.done.length} فيديو</span>
          <button
            className="lnk"
            onClick={() => {
              if (!window.confirm('إلغاء الاشتراك؟')) return;
              saveDb({
                ...db,
                enr: db.enr.filter((x) => !(x.u === stu.id && x.c === e.c))
              });
              setDialogContent(null);
            }}
          >
            إلغاء الاشتراك
          </button>
        </div>
      ))}
    </div>
  );
}

export default StudentManageModal;
