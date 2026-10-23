import React, { useState } from 'react';
import { useKhutwa } from '../../hooks';
import { gid, fmt } from '../../utils';

export function StudentManageModal({ dialogContent }) {
  const { db, saveDb, showToast, setDialogContent, getCourse } = useKhutwa();
  const [newPass, setNewPass] = useState('');
  const [showPassSection, setShowPassSection] = useState(false);
  const [courseToGrant, setCourseToGrant] = useState('');

  if (!dialogContent || dialogContent.type !== 'student') return null;

  const stu = dialogContent.student;
  const p = stu.profile || {};
  const stuEnr = db.enr.filter((e) => e.u === stu.id);
  const unEnrolledCourses = db.courses.filter((c) => !stuEnr.some((e) => e.c === c.id));

  // Reset Password Handler
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPass.trim() || newPass.trim().length < 4) {
      showToast('يرجى إدخال كلمة مرور مكونة من 4 أحرف أو أرقام على الأقل');
      return;
    }
    const target = db.users.find((u) => u.id === stu.id);
    if (target) {
      target.pass = newPass.trim();
      saveDb({ ...db });
      showToast(`تم تعيين كلمة مرور جديدة للطالب (${target.name}) بنجاح!`);
      setNewPass('');
      setShowPassSection(false);
    }
  };

  // Toggle Block/Active Status
  const handleToggleStatus = () => {
    const target = db.users.find((u) => u.id === stu.id);
    if (!target) return;
    const isCurrentlyBlocked = target.status === 'blocked';
    target.status = isCurrentlyBlocked ? 'active' : 'blocked';
    saveDb({ ...db });
    showToast(isCurrentlyBlocked ? 'تم تفعيل حساب الطالب بنجاح' : 'تم إيقاف حساب الطالب');
  };

  // Grant Free Course
  const handleGrantCourse = () => {
    if (!courseToGrant) return;
    const targetCourse = getCourse(courseToGrant);
    if (!targetCourse) return;

    const already = db.enr.some((e) => e.u === stu.id && e.c === courseToGrant);
    if (already) {
      showToast('الطالب مشترك بالفعل في هذا المسار');
      return;
    }

    const nextEnr = [...db.enr, { u: stu.id, c: courseToGrant, date: Date.now(), done: [] }];
    const nextTx = [
      {
        id: gid('t'),
        u: stu.id,
        amount: 0,
        type: 'grant',
        note: `اشتراك من الأدمن في: ${targetCourse.title}`,
        date: Date.now()
      },
      ...db.tx
    ];

    saveDb({ ...db, enr: nextEnr, tx: nextTx });
    showToast(`تم تفعيل مسار (${targetCourse.title}) للطالب مجاناً بنجاح!`);
    setCourseToGrant('');
  };

  // Delete Student
  const handleDeleteStudent = () => {
    if (!window.confirm(`هل أنت متأكد تماماً من حذف حساب الطالب (${stu.name}) وجميع بياناته واشتراكاته؟`)) {
      return;
    }
    const nextUsers = db.users.filter((u) => u.id !== stu.id);
    const nextEnr = db.enr.filter((e) => e.u !== stu.id);
    const nextTx = db.tx.filter((t) => t.u !== stu.id);
    const nextSubs = (db.subRequests || []).filter((s) => s.userId !== stu.id);
    const nextLeads = (db.leads || []).filter((l) => l.userId !== stu.id);

    saveDb({
      ...db,
      users: nextUsers,
      enr: nextEnr,
      tx: nextTx,
      subRequests: nextSubs,
      leads: nextLeads
    });
    showToast('تم حذف حساب الطالب بنجاح');
    setDialogContent(null);
  };

  const whatsappUrl = stu.phone ? `https://wa.me/${String(stu.phone).replace(/\D/g, '').replace(/^0/, '20')}` : null;

  return (
    <div className="admin-student-modal">
      {/* Header */}
      <div className="student-modal-header">
        <div className="student-modal-avatar">
          {stu.name ? stu.name.trim().charAt(0) : 'ط'}
        </div>
        <div className="student-modal-meta">
          <h2>{stu.name}</h2>
          <span className="student-modal-sub">{stu.email} · انضم {fmt(stu.created || Date.now())}</span>
          <div className="student-modal-chips">
            <span className={`admin-status-pill ${stu.status === 'blocked' ? 'admin-status-rejected' : 'admin-status-approved'}`}>
              <span className="admin-status-dot" />
              {stu.status === 'blocked' ? 'حساب موقوف' : 'حساب نشط'}
            </span>
            <span className="admin-price-tag" style={{ fontSize: '.85rem' }}>
              الرصيد: {stu.balance || 0} ج.م
            </span>
            {stu.phone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="student-wa-link"
                title="مراسلة واتساب"
              >
                <i className="fa-brands fa-whatsapp"></i>
                {stu.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Academic & Profile Info */}
      <div className="student-info-section">
        <h4 className="student-section-title">
          <i className="fa-solid fa-id-card"></i>
          البيانات الأكاديمية والشخصية
        </h4>
        <div className="student-profile-grid">
          <div className="profile-item">
            <span className="profile-k">الجامعة:</span>
            <span className="profile-v">{p.university || 'غير محدد'}</span>
          </div>
          <div className="profile-item">
            <span className="profile-k">الكلية / التخصص:</span>
            <span className="profile-v">{p.faculty || 'غير محدد'}</span>
          </div>
          <div className="profile-item">
            <span className="profile-k">السنة الدراسية:</span>
            <span className="profile-v">{p.year || 'غير محدد'}</span>
          </div>
          <div className="profile-item">
            <span className="profile-k">الهدف التدريبي:</span>
            <span className="profile-v">{p.goal || 'غير محدد'}</span>
          </div>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="student-info-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 className="student-section-title" style={{ margin: 0 }}>
            <i className="fa-solid fa-key"></i>
            أمان الحساب وكلمة المرور
          </h4>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setShowPassSection(!showPassSection)}
          >
            {showPassSection ? 'إلغاء' : <><i className="fa-solid fa-key" style={{ marginInlineEnd: '6px' }}></i> إعادة تعيين كلمة المرور</>}
          </button>
        </div>

        {showPassSection && (
          <form onSubmit={handleResetPassword} className="pass-reset-form" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="fi"
                placeholder="أدخل كلمة المرور الجديدة (مثال: 123456)"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '.85rem' }}
                onClick={() => setNewPass('khutwa' + Math.floor(1000 + Math.random() * 9000))}
              >
                توليد عشوائي
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px' }}>
                حفظ
              </button>
            </div>
            <small className="hint" style={{ marginTop: '4px', display: 'block' }}>
              كلمة المرور المسجلة حالياً في النظام: <strong>{stu.pass || 'غير محددة'}</strong>
            </small>
          </form>
        )}
      </div>

      {/* Balance Adjust Form */}
      <div className="student-info-section">
        <h4 className="student-section-title">
          <i className="fa-solid fa-wallet"></i>
          إدارة رصيد المحفظة
        </h4>
        <form
          className="lr"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const amount = Math.abs(+fd.get('amount'));
            const isAdd = fd.get('op') === 'add';
            const target = db.users.find((u) => u.id === stu.id);
            if (!target) return;
            if (!isAdd && amount > (target.balance || 0)) {
              showToast('المبلغ المراد خصمه أكبر من رصيد الطالب الحالي');
              return;
            }
            target.balance = (target.balance || 0) + (isAdd ? amount : -amount);
            db.tx.unshift({
              id: gid('t'),
              u: stu.id,
              amount: isAdd ? amount : -amount,
              type: isAdd ? 'topup' : 'adjust',
              note: fd.get('note') || (isAdd ? 'شحن رصيد يدوي من الأدمن' : 'خصم يدوي من الأدمن'),
              date: Date.now()
            });
            saveDb({ ...db });
            showToast(`تم ${isAdd ? 'شحن' : 'خصم'} ${amount} ج.م بنجاح!`);
            e.target.reset();
          }}
        >
          <select className="fi" name="op" style={{ maxWidth: '120px' }}>
            <option value="add">شحن (+)</option>
            <option value="sub">خصم (−)</option>
          </select>
          <input className="fi" name="amount" type="number" min="1" required placeholder="المبلغ" />
          <input className="fi" name="note" placeholder="ملاحظة العملية..." />
          <button className="btn btn-primary" type="submit">تعديل الرصيد</button>
        </form>
      </div>

      {/* Course Subscriptions Section */}
      <div className="student-info-section">
        <h4 className="student-section-title">
          <i className="fa-solid fa-graduation-cap"></i>
          المسارات والكورسات المشترك فيها ({stuEnr.length})
        </h4>

        {stuEnr.length > 0 ? (
          <div className="student-enr-list">
            {stuEnr.map((e) => {
              const c = getCourse(e.c);
              const pc = c?.lessons?.length ? Math.round((e.done.length / c.lessons.length) * 100) : 0;
              return (
                <div key={e.c} className="student-enr-item">
                  <div>
                    <strong>{c?.title || 'مسار محذوف'}</strong>
                    <span className="hint" style={{ marginInlineStart: '10px' }}>
                      {e.done.length} من {c?.lessons?.length || 0} درس مكتمل ({pc}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="admin-action-btn-reject"
                    style={{ padding: '4px 10px', fontSize: '.78rem' }}
                    onClick={() => {
                      if (!window.confirm(`هل أنت متأكد من إلغاء اشتراك الطالب في مسار (${c?.title})؟`)) return;
                      saveDb({
                        ...db,
                        enr: db.enr.filter((x) => !(x.u === stu.id && x.c === e.c))
                      });
                      showToast('تم إلغاء الاشتراك بنجاح');
                    }}
                  >
                    إلغاء الاشتراك
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="hint" style={{ margin: '8px 0' }}>الطالب غير مشترك في أي مسار تدريبي حالياً.</p>
        )}

        {/* Grant new course */}
        {unEnrolledCourses.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
            <select
              className="fi"
              value={courseToGrant}
              onChange={(e) => setCourseToGrant(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">+ اختر مساراً لتفعيله للطالب مجاناً من الأدمن...</option>
              {unEnrolledCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title} ({c.price} ج.م)</option>
              ))}
            </select>
            <button
              type="button"
              className="btn"
              disabled={!courseToGrant}
              onClick={handleGrantCourse}
            >
              منح المسار
            </button>
          </div>
        )}
      </div>

      {/* Account Control Actions */}
      <div className="student-modal-danger-zone">
        <button
          type="button"
          className="btn-secondary"
          style={{ borderColor: stu.status === 'blocked' ? '#10b981' : '#f59e0b', color: stu.status === 'blocked' ? '#10b981' : '#f59e0b' }}
          onClick={handleToggleStatus}
        >
          {stu.status === 'blocked' ? (
            <><i className="fa-solid fa-user-check" style={{ marginInlineEnd: '6px' }}></i> تفعيل وإلغاء حظر الحساب</>
          ) : (
            <><i className="fa-solid fa-ban" style={{ marginInlineEnd: '6px' }}></i> إيقاف وحظر حساب الطالب</>
          )}
        </button>
        <button
          type="button"
          className="admin-action-btn-delete"
          onClick={handleDeleteStudent}
        >
          <i className="fa-solid fa-trash-can" style={{ marginInlineEnd: '6px' }}></i> حذف الحساب بالكامل
        </button>
      </div>
    </div>
  );
}

export default StudentManageModal;
