import React, { useState, useEffect } from 'react';
import { useKhutwa } from '../../hooks';
import { YEARS, GOALS, TX, ART } from '../../constants';
import { fmt, gid } from '../../utils';

export function StudentDashboard() {
  const {
    user,
    db,
    saveDb,
    showToast,
    dtab,
    setDtab,
    getCourse,
    markInquiriesAsRead,
    markSingleInquiryAsRead,
    markAllNotificationsAsRead,
    markSingleNotificationAsRead,
    totalStudentUnreadCount,
    unreadRepliesCount,
    unreadNotifsCount,
    userNotifications,
    setDialogContent,
    copyToClipboard
  } = useKhutwa();
  const [newInqText, setNewInqText] = useState('');
  const [newInqTrack, setNewInqTrack] = useState('frontend');
  const [inqSent, setInqSent] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // all | unread | inquiries | system

  if (!user) return null;
  const p = user.profile || {};
  const n = [user.phone, p.university, p.faculty, p.year, p.goal].filter(Boolean).length;
  const mine = db.enr.filter((e) => e.u === user.id);
  const userPendingCourses = (db.subRequests || []).filter((s) => s.userId === user.id && (!s.type || s.type !== 'topup') && s.status === 'pending');
  const userPendingTopups = (db.subRequests || []).filter((s) => s.userId === user.id && s.type === 'topup' && s.status === 'pending');
  const free = db.courses.filter((c) => c.pub && !mine.some((e) => e.c === c.id));

  const myInquiries = (db.leads || []).filter((l) =>
    l.userId === user.id ||
    (user.phone && l.phone === user.phone) ||
    (user.email && l.userEmail === user.email)
  );

  // Prepare unified notifications list
  const studentInqNotifs = myInquiries.filter((l) => l.reply).map((l) => ({
    id: `inq_${l.id}`,
    originalId: l.id,
    kind: 'inquiry',
    type: 'inquiry_reply',
    title: 'رد إدارة خطوة على استفسارك',
    text: l.reply,
    userQuestion: l.message,
    trackId: l.track,
    date: l.repliedAt || l.date,
    read: !!l.readByStudent,
    link: '#/dashboard',
    dtab: 'inquiries'
  }));

  const studentSysNotifs = (db.notifications || []).filter((notif) => {
    return notif.userId === user.id || notif.userId === 'all';
  }).map((notif) => ({
    id: `notif_${notif.id}`,
    originalId: notif.id,
    kind: 'notification',
    type: notif.type || 'info',
    title: notif.title || 'إشعار من الأكاديمية',
    text: notif.message,
    courseId: notif.courseId,
    date: notif.date,
    read: !!notif.read,
    link: notif.link || '#/dashboard',
    dtab: notif.dtab || 'notifications'
  }));

  const allStudentNotifs = [...studentInqNotifs, ...studentSysNotifs].sort((a, b) => b.date - a.date);

  const filteredNotifs = allStudentNotifs.filter((item) => {
    if (notifFilter === 'unread') return !item.read;
    if (notifFilter === 'inquiries') return item.kind === 'inquiry';
    if (notifFilter === 'system') return item.kind === 'notification';
    return true;
  });

  return (
    <div className="wrap">
      {n < 5 && dtab !== 'profile' && (
        <div className="banner">
          <div className="steps">
            {[1, 2, 3, 4, 5].map((num) => (
              <i key={num} className={num <= n ? 'on' : ''} style={{ '--n': num }}></i>
            ))}
          </div>
          <div>
            <b>كمّل بياناتك ({n}/5)</b><br />
            <button className="lnk" onClick={() => setDtab('profile')}>
              كمّل دلوقتي <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: '4px' }}></i>
            </button>
          </div>
        </div>
      )}

      {dtab === 'courses' && (
        <>
          <h1>أهلًا {user.name.split(' ')[0]}</h1>

          {totalStudentUnreadCount > 0 && (
            <div className="banner notif-highlight-banner" style={{ borderInlineStartColor: 'var(--cyan)', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div className="notif-banner-badge-icon">
                  <i className="fa-solid fa-bell"></i>
                  <span className="notif-beacon-dot" />
                </div>
                <div>
                  <b style={{ fontSize: '1.02rem' }}>لديك {totalStudentUnreadCount} إشعار جديد في حسابك!</b>
                  <p className="hint" style={{ margin: '4px 0 0' }}>
                    تابع ردود الإدارة على استفساراتك وتأكيدات تفعيل الكورسات وشحن المحفظة.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setDtab('notifications')}
                style={{ whiteSpace: 'nowrap' }}
              >
                عرض الإشعارات ({totalStudentUnreadCount}) <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: '4px' }}></i>
              </button>
            </div>
          )}

          {userPendingCourses.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2>طلبات اشتراك قيد المراجعة ({userPendingCourses.length})</h2>
              {userPendingCourses.map((pr) => (
                <div key={pr.id} className="banner" style={{ borderInlineStartColor: 'var(--cyan)' }}>
                  <div>
                    <b><i className="fa-solid fa-hourglass-half" style={{ marginInlineEnd: '6px' }}></i> {pr.courseTitle} — {pr.price} ج.م</b>
                    <p className="hint">
                      تم إرسال إيصال التحويل عبر {pr.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}. سيقوم الأدمن بمراجعته وفتح الكورس لك قريباً.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2>كورساتي</h2>
          {mine.length > 0 ? (
            mine.map((e) => {
              const c = getCourse(e.c);
              if (!c) return null;
              const pc = c.lessons.length ? Math.round((e.done.length / c.lessons.length) * 100) : 0;
              return (
                <div key={e.c} className="rw">
                  <div className="mn">
                    <div className="th">{c.img ? <img src={c.img} alt="" /> : (ART[c.id] || ART.gen)}</div>
                    <div>
                      <b>{c.title}</b>
                      <small>{e.done.length} من {c.lessons.length} فيديو · {pc}%</small>
                      <div className="bar"><i style={{ width: `${pc}%` }}></i></div>
                    </div>
                  </div>
                  <a className="btn" href={`#/watch/${c.id}/${c.lessons[0]?.id || ''}`}>كمّل</a>
                </div>
              );
            })
          ) : (
            <p className="hint">لسه مشتركتش في أي كورس. اختار مسارك من تحت.</p>
          )}

          {free.length > 0 && (
            <>
              <h2>مسارات متاحة</h2>
              {free.map((c) => (
                <div key={c.id} className="rw">
                  <div className="mn">
                    <div className="th">{c.img ? <img src={c.img} alt="" /> : (ART[c.id] || ART.gen)}</div>
                    <div>
                      <b>{c.title}</b>
                      <small>{c.weeks} أسابيع · {c.lessons.length} فيديو · {c.price} ج.م</small>
                    </div>
                  </div>
                  <a className="btn" href={`#/course/${c.id}`}>التفاصيل والاشتراك</a>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {dtab === 'profile' && (
        <>
          <h1>ملفي</h1>
          <form
            className="fm"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              user.name = fd.get('name').trim() || user.name;
              user.phone = fd.get('phone').trim();
              user.profile = {
                university: fd.get('university').trim(),
                faculty: fd.get('faculty').trim(),
                year: fd.get('year'),
                goal: fd.get('goal')
              };
              saveDb({ ...db });
              showToast('اتحفظت بياناتك');
              setDtab('courses');
            }}
          >
            <input className="fi" name="name" defaultValue={user.name} placeholder="الاسم" required />
            <input className="fi" name="phone" defaultValue={user.phone} placeholder="رقم واتساب" inputMode="tel" />
            <input className="fi" name="university" defaultValue={p.university || ''} placeholder="الجامعة" />
            <input className="fi" name="faculty" defaultValue={p.faculty || ''} placeholder="الكلية / التخصص" />
            <div className="two">
              <select className="fi" name="year" defaultValue={p.year || ''}>
                <option value="">السنة الدراسية</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="fi" name="goal" defaultValue={p.goal || ''}>
                <option value="">هدفك</option>
                {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button className="btn" type="submit">حفظ</button>
          </form>
        </>
      )}

      {dtab === 'wallet' && (
        <div className="wallet-view-container">
          {/* Pending Top-ups notice */}
          {userPendingTopups.length > 0 && (
            <div className="wallet-pending-alert">
              {userPendingTopups.map((top) => (
                <div key={top.id} className="wallet-pending-item">
                  <div className="pending-icon"><i className="fa-solid fa-hourglass-half"></i></div>
                  <div className="pending-content">
                    <b>طلب شحن رصيد بقيمة {top.amount || top.price} ج.م قيد المراجعة</b>
                    <p>
                      تم استلام إيصال التحويل عبر ({top.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}) من المحول منه ({top.sender}). سيقوم الأدمن بمطابقته وإيداع المبلغ في محفظتك فوراً.
                    </p>
                  </div>
                  <span className="pending-badge">قيد التأكيد</span>
                </div>
              ))}
            </div>
          )}

          {/* Hero Balance FinTech Card */}
          <div className="wallet-hero-card">
            <div className="wallet-hero-top">
              <div className="wallet-badge-chip">
                <i className="fa-solid fa-wallet"></i>
                <span>محفظة خطوة الرقمية</span>
              </div>
              <div className="wallet-status-tag">
                <span className="pulse-dot"></span>
                <span>نشط وجاهز للاستخدام</span>
              </div>
            </div>

            <div className="wallet-balance-row">
              <div className="wallet-balance-display">
                <span className="wallet-val">{user.balance || 0}</span>
                <span className="wallet-curr">ج.م</span>
              </div>
              <p className="wallet-subtext">
                رصيدك الحالي متاح فورياً للاشتراك في أي مسار تدريبي أو ورشة عمل دون الحاجة لانتظار التحويل اليدوي.
              </p>
            </div>

            <div className="wallet-actions-row">
              <button
                type="button"
                className="wallet-btn-primary"
                onClick={() => setDialogContent({ type: 'topup_balance' })}
              >
                <i className="fa-solid fa-plus-circle"></i>
                <span>شحن رصيد الآن</span>
              </button>
              <button
                type="button"
                className="wallet-btn-secondary"
                onClick={() => setDtab('courses')}
              >
                <i className="fa-solid fa-compass"></i>
                <span>استعراض المسارات</span>
              </button>
            </div>
          </div>

          {/* Instant Transfer Numbers */}
          <div className="wallet-methods-overview">
            <div className="method-box vf-box">
              <div className="method-header">
                <div className="method-icon-wrap">
                  <i className="fa-solid fa-mobile-screen-button"></i>
                </div>
                <div>
                  <strong>فودافون كاش والمحافظ</strong>
                  <span>تحويل من أي محفظة إلكترونية</span>
                </div>
              </div>
              <div className="method-num-row">
                <span className="method-val">{db.settings?.vodafone || '01028103634'}</span>
                <button
                  type="button"
                  className="btn-copy-mini"
                  onClick={() => copyToClipboard(db.settings?.vodafone || '01028103634', 'رقم فودافون كاش')}
                >
                  <i className="fa-regular fa-copy"></i>
                  <span>نسخ</span>
                </button>
              </div>
            </div>

            <div className="method-box insta-box">
              <div className="method-header">
                <div className="method-icon-wrap">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <strong>إنستاباي InstaPay</strong>
                  <span>تحويل لحظي مباشر للعنوان المعتمد</span>
                </div>
              </div>
              <div className="method-num-row">
                <span className="method-val">{db.settings?.instapay || 'khutwa@instapay'}</span>
                <button
                  type="button"
                  className="btn-copy-mini"
                  onClick={() => copyToClipboard(db.settings?.instapay || 'khutwa@instapay', 'معرف إنستاباي')}
                >
                  <i className="fa-regular fa-copy"></i>
                  <span>نسخ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Operations History */}
          <div className="wallet-history-card">
            <div className="history-header">
              <h3>
                <i className="fa-solid fa-receipt"></i>
                سجل العمليات المالية
              </h3>
              <span className="history-count">
                {db.tx.filter((t) => t.u === user.id).length} معاملة
              </span>
            </div>

            <div className="history-table-wrap">
              {db.tx.filter((t) => t.u === user.id).length > 0 ? (
                <table className="wallet-tbl">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>النوع</th>
                      <th>تفاصيل المعاملة</th>
                      <th>المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.tx.filter((t) => t.u === user.id).map((t) => {
                      const isTopup = t.type === 'topup' || t.amount > 0;
                      return (
                        <tr key={t.id}>
                          <td>
                            <span className="history-date">{fmt(t.date)}</span>
                          </td>
                          <td>
                            <span className={`tx-type-badge ${isTopup ? 'badge-in' : 'badge-out'}`}>
                              <i className={`fa-solid ${isTopup ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}`}></i>
                              {TX[t.type] || t.type}
                            </span>
                          </td>
                          <td>
                            <span className="history-note">{t.note}</span>
                          </td>
                          <td dir="ltr">
                            <span className={`history-amount ${isTopup ? 'amount-pos' : 'amount-neg'}`}>
                              {isTopup ? '+' : ''}{t.amount} ج.م
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="wallet-empty-state">
                  <div className="wallet-empty-icon"><i className="fa-solid fa-wallet"></i></div>
                  <div className="wallet-empty-title">لا توجد عمليات سابقة حتى الآن</div>
                  <div className="wallet-empty-desc">
                    عند شحن رصيدك أو الاشتراك في أي دورة تدريبية، ستظهر كافة تفاصيل المعاملات هنا.
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ marginTop: '14px' }}
                    onClick={() => setDialogContent({ type: 'topup_balance' })}
                  >
                    + شحن أول رصيد لك الآن
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {dtab === 'inquiries' && (
        <div className="inquiries-view">
          <div className="inq-header">
            <div>
              <h1>استفساراتي والدعم الفني</h1>
              <p className="ds">تابع أسئلتك وردود فريق أكاديمية خطوة عليها، أو أرسل استفساراً جديداً في أي وقت.</p>
            </div>
          </div>

          {/* Quick new inquiry box */}
          <div className="inq-new-box">
            <h3>+ إرسال استفسار جديد</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newInqText.trim()) return;
                const newLead = {
                  id: gid('q'),
                  userId: user.id,
                  userEmail: user.email || '',
                  name: user.name,
                  phone: user.phone || '',
                  track: newInqTrack,
                  message: newInqText.trim(),
                  date: Date.now(),
                  status: 'new',
                  reply: '',
                  repliedAt: null,
                  readByStudent: true
                };
                saveDb({ ...db, leads: [newLead, ...(db.leads || [])] });
                setNewInqText('');
                setInqSent(true);
                showToast('تم إرسال استفسارك بنجاح! سيصلك الرد هنا قريباً.');
                setTimeout(() => setInqSent(false), 3500);
              }}
            >
              <div className="inq-track-select">
                <span>المسار المعني:</span>
                <label>
                  <input type="radio" name="inqTrack" value="frontend" checked={newInqTrack === 'frontend'} onChange={() => setNewInqTrack('frontend')} />
                  <span>واجهات الويب</span>
                </label>
                <label>
                  <input type="radio" name="inqTrack" value="ux" checked={newInqTrack === 'ux'} onChange={() => setNewInqTrack('ux')} />
                  <span>UX/UI</span>
                </label>
                <label>
                  <input type="radio" name="inqTrack" value="marketing" checked={newInqTrack === 'marketing'} onChange={() => setNewInqTrack('marketing')} />
                  <span>التسويق</span>
                </label>
              </div>
              <textarea
                className="fi"
                rows={3}
                placeholder="اكتب استفسارك أو سؤالك هنا..."
                value={newInqText}
                onChange={(e) => setNewInqText(e.target.value)}
                required
              />
              <button className="btn" type="submit">إرسال الاستفسار الآن</button>
              {inqSent && <span className="inq-sent-badge"><i className="fa-solid fa-circle-check" style={{ marginInlineEnd: '4px' }}></i> تم الإرسال بنجاح</span>}
            </form>
          </div>

          {/* List of past inquiries & replies */}
          <h2>سجل الاستفسارات والردود ({myInquiries.length})</h2>
          {myInquiries.length > 0 ? (
            <div className="inquiries-list">
              {myInquiries.map((inq) => (
                <div key={inq.id} className={`inquiry-card ${inq.reply ? 'has-reply' : 'waiting'}`}>
                  <div className="inq-card-head">
                    <span className="inq-track-badge">{getCourse(inq.track)?.title || inq.track}</span>
                    <span className="inq-date">{fmt(inq.date)}</span>
                    <span className={`inq-status-badge ${inq.reply ? 'status-answered' : 'status-pending'}`}>
                      {inq.reply ? (
                        <><i className="fa-solid fa-circle-check" style={{ marginInlineEnd: '4px' }}></i> تم الرد من الأكاديمية</>
                      ) : (
                        <><i className="fa-solid fa-hourglass-half" style={{ marginInlineEnd: '4px' }}></i> قيد المراجعة</>
                      )}
                    </span>
                    {inq.reply && !inq.readByStudent && (
                      <button
                        type="button"
                        className="btn-mark-read-chip"
                        onClick={() => markSingleInquiryAsRead(inq.id)}
                        title="تحديد هذا الرد كمقروء"
                      >
                        <i className="fa-solid fa-check"></i>
                        <span>تحديد كمقروء</span>
                      </button>
                    )}
                  </div>

                  <div className="inq-question-bubble">
                    <div className="inq-sender-tag">سؤالك:</div>
                    <p className="inq-text">{inq.message || 'طلب تواصل واستفسار عن المسار'}</p>
                  </div>

                  {inq.reply ? (
                    <div className="inq-reply-bubble">
                      <div className="inq-admin-tag">
                        <i className="fa-solid fa-graduation-cap"></i>
                        رد إدارة أكاديمية خطوة:
                        {inq.repliedAt && <small className="inq-reply-date">({fmt(inq.repliedAt)})</small>}
                      </div>
                      <p className="inq-reply-text">{inq.reply}</p>
                    </div>
                  ) : (
                    <div className="inq-waiting-hint">
                      <i className="fa-regular fa-clock"></i>
                      استفسارك قيد المتابعة من فريق الدعم والتوجيه، وسيصلك الرد هنا وإشعار عبر الجرس.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state" style={{ marginTop: '20px' }}>
              <div className="admin-empty-icon"><i className="fa-solid fa-comments"></i></div>
              <div className="admin-empty-title">لا توجد استفسارات سابقة</div>
              <div className="admin-empty-desc">يمكنك كتابة أي استفسار أو سؤال في النموذج بالأعلى وسيقوم فريق الأكاديمية بالرد عليك مباشرة.</div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB: NOTIFICATIONS CENTER (مركز الإشعارات والتنبيهات)
          ======================================================== */}
      {dtab === 'notifications' && (
        <div className="notifs-center-view">
          <div className="notif-center-header">
            <div>
              <div className="notif-center-badge">
                <i className="fa-solid fa-bell"></i>
                مركز الإشعارات والتنبيهات
              </div>
              <h1 style={{ margin: '8px 0 6px', fontSize: '1.8rem', fontWeight: 900 }}>
                كل التنبيهات والإشعارات
              </h1>
              <p className="ds" style={{ margin: 0 }}>
                تابع ردود إدارة الأكاديمية على استفساراتك وتأكيدات تفعيل الكورسات وشحن المحفظة.
              </p>
            </div>

            {totalStudentUnreadCount > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline notif-header-mark-all"
                onClick={() => {
                  if (markAllNotificationsAsRead) markAllNotificationsAsRead();
                  showToast('تم تحديد جميع الإشعارات كمقروءة');
                }}
              >
                <i className="fa-solid fa-check-double" style={{ marginInlineEnd: '6px' }}></i>
                تحديد الكل كمقروء ({totalStudentUnreadCount})
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="notif-filter-bar">
            <button
              type="button"
              className={`notif-filter-chip ${notifFilter === 'all' ? 'active' : ''}`}
              onClick={() => setNotifFilter('all')}
            >
              الكل ({allStudentNotifs.length})
            </button>
            <button
              type="button"
              className={`notif-filter-chip ${notifFilter === 'unread' ? 'active' : ''}`}
              onClick={() => setNotifFilter('unread')}
            >
              غير المقروءة ({totalStudentUnreadCount})
            </button>
            <button
              type="button"
              className={`notif-filter-chip ${notifFilter === 'inquiries' ? 'active' : ''}`}
              onClick={() => setNotifFilter('inquiries')}
            >
              ردود الاستفسارات ({studentInqNotifs.length})
            </button>
            <button
              type="button"
              className={`notif-filter-chip ${notifFilter === 'system' ? 'active' : ''}`}
              onClick={() => setNotifFilter('system')}
            >
              تنبيهات الأكاديمية ({studentSysNotifs.length})
            </button>
          </div>

          {/* Notifications List */}
          {filteredNotifs.length > 0 ? (
            <div className="notif-cards-grid">
              {filteredNotifs.map((item) => {
                const isUnread = !item.read;
                let iconClass = 'fa-solid fa-bell';
                let tagLabel = 'أكاديمية خطوة';
                let tagColor = 'var(--cyan)';

                if (item.type === 'inquiry_reply') {
                  iconClass = 'fa-solid fa-comments';
                  tagLabel = item.trackId ? (getCourse(item.trackId)?.title || 'رد على استفسار') : 'رد الإدارة';
                  tagColor = '#f59e0b';
                } else if (item.type === 'course_approved') {
                  iconClass = 'fa-solid fa-circle-check';
                  tagLabel = 'تم تفعيل الكورس';
                  tagColor = '#22c55e';
                } else if (item.type === 'topup_approved') {
                  iconClass = 'fa-solid fa-coins';
                  tagLabel = 'شحن رصيد المحفظة';
                  tagColor = 'var(--cyan)';
                } else if (item.type === 'welcome') {
                  iconClass = 'fa-solid fa-rocket';
                  tagLabel = 'ترحيب';
                  tagColor = '#8b5cf6';
                }

                return (
                  <div
                    key={item.id}
                    className={`notif-dashboard-card ${isUnread ? 'is-unread' : 'is-read'}`}
                  >
                    <div className="notif-db-card-top">
                      <div className="notif-db-card-icon" style={{ color: tagColor, background: `rgba(43, 185, 211, 0.1)` }}>
                        <i className={iconClass}></i>
                      </div>
                      <div className="notif-db-card-meta">
                        <span className="notif-db-tag" style={{ color: tagColor }}>
                          {tagLabel}
                        </span>
                        <span className="notif-db-date">
                          <i className="fa-regular fa-clock" style={{ marginInlineEnd: '4px' }}></i>
                          {fmt(item.date)}
                        </span>
                      </div>
                      {isUnread && (
                        <span className="notif-db-unread-badge">
                          <span className="notif-beacon-dot" /> جديد
                        </span>
                      )}
                    </div>

                    <div className="notif-db-card-body">
                      <h3 className="notif-db-title">{item.title}</h3>
                      <p className="notif-db-text">{item.text}</p>

                      {item.userQuestion && (
                        <div className="notif-db-question-box">
                          <span className="notif-db-q-label">سؤالك المرسل:</span>
                          <p className="notif-db-q-text">«{item.userQuestion}»</p>
                        </div>
                      )}
                    </div>

                    <div className="notif-db-card-footer">
                      <div className="notif-db-actions-left">
                        {item.type === 'course_approved' && item.courseId && (
                          <a className="btn btn-sm" href={`#/watch/${item.courseId}/${getCourse(item.courseId)?.lessons[0]?.id || ''}`}>
                            مشاهدة الكورس الآن <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: '4px' }}></i>
                          </a>
                        )}

                        {item.kind === 'inquiry' && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                              if (markSingleInquiryAsRead) markSingleInquiryAsRead(item.originalId);
                              setDtab('inquiries');
                            }}
                          >
                            عرض المحادثة كاملة <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: '4px' }}></i>
                          </button>
                        )}

                        {item.type === 'topup_approved' && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                              if (markSingleNotificationAsRead) markSingleNotificationAsRead(item.originalId);
                              setDtab('wallet');
                            }}
                          >
                            عرض المحفظة والرصيد <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: '4px' }}></i>
                          </button>
                        )}

                        {item.type === 'welcome' && (
                          <a className="btn btn-sm" href="#j">
                            استكشاف المسارات <i className="fa-solid fa-arrow-left" style={{ marginInlineStart: '4px' }}></i>
                          </a>
                        )}
                      </div>

                      {isUnread && (
                        <button
                          type="button"
                          className="notif-db-chip-read"
                          onClick={() => {
                            if (item.kind === 'inquiry') {
                              if (markSingleInquiryAsRead) markSingleInquiryAsRead(item.originalId);
                            } else {
                              if (markSingleNotificationAsRead) markSingleNotificationAsRead(item.originalId);
                            }
                            showToast('تم تحديد الإشعار كمقروء');
                          }}
                        >
                          <i className="fa-solid fa-check" style={{ marginInlineEnd: '4px' }}></i> تحديد كمقروء
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty-state" style={{ marginTop: '30px' }}>
              <div className="admin-empty-icon"><i className="fa-regular fa-bell"></i></div>
              <div className="admin-empty-title">لا توجد إشعارات في هذا التبويب</div>
              <div className="admin-empty-desc">
                {notifFilter === 'unread'
                  ? 'تمت قراءة جميع الإشعارات والتنبيهات الخاصة بك بالكامل.'
                  : 'ستظهر جميع إشعارات وتنبيهات الأكاديمية وردود المدربين هنا.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
