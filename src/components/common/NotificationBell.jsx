import React, { useState, useRef, useEffect } from 'react';
import { useKhutwa } from '../../hooks';
import { fmt } from '../../utils';

export function NotificationBell() {
  const {
    user,
    db,
    totalStudentUnreadCount,
    unreadRepliesCount,
    unreadNotifsCount,
    pendingLeadsCount,
    pendingSubCount,
    setDtab,
    setAtab,
    markAllNotificationsAsRead,
    markSingleInquiryAsRead,
    markSingleNotificationAsRead,
    getCourse
  } = useKhutwa();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const isAdmin = user && user.role === 'admin';
  const isGuest = !user;

  // Unread badge count calculation (guests have 0 unread)
  const unreadCount = isGuest
    ? 0
    : isAdmin
      ? (pendingLeadsCount + pendingSubCount)
      : (totalStudentUnreadCount ?? (unreadRepliesCount + unreadNotifsCount));

  // Prepare unified list for Student: Inquiries replies + Platform notifications
  let studentItems = [];
  if (user && !isAdmin) {
    const inqItems = (db.leads || []).filter((l) => {
      const isUserLead = l.userId === user.id ||
        (user.phone && l.phone === user.phone) ||
        (user.email && l.userEmail === user.email);
      return isUserLead && l.reply;
    }).map((l) => ({
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

    const notifItems = (db.notifications || []).filter((n) => {
      return n.userId === user.id || n.userId === 'all';
    }).map((n) => ({
      id: `notif_${n.id}`,
      originalId: n.id,
      kind: 'notification',
      type: n.type || 'info',
      title: n.title || 'إشعار جديد',
      text: n.message,
      courseId: n.courseId,
      date: n.date,
      read: !!n.read,
      link: n.link || '#/dashboard',
      dtab: n.dtab || 'notifications'
    }));

    studentItems = [...inqItems, ...notifItems].sort((a, b) => b.date - a.date);
  }

  // Prepare notifications list for Admin
  const adminPendingLeads = (db.leads || []).filter((l) => l.status === 'new' || !l.reply);
  const adminPendingSubs = (db.subRequests || []).filter((s) => s.status === 'pending');

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    if (markAllNotificationsAsRead) {
      markAllNotificationsAsRead();
    }
  };

  const handleStudentItemClick = (item) => {
    if (item.kind === 'inquiry') {
      if (markSingleInquiryAsRead) markSingleInquiryAsRead(item.originalId);
    } else {
      if (markSingleNotificationAsRead) markSingleNotificationAsRead(item.originalId);
    }
    setIsOpen(false);
    window.location.hash = item.link || '#/dashboard';
    if (setDtab && item.dtab) {
      setDtab(item.dtab);
    }
  };

  const handleAdminGoTo = (tab) => {
    setIsOpen(false);
    window.location.hash = '#/admin';
    if (setAtab) setAtab(tab);
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className={`bell-btn ${isOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={handleToggle}
        aria-label="مركز الإشعارات والتنبيهات"
        aria-expanded={isOpen}
        title={
          isGuest
            ? 'تنبيهات أكاديمية خطوة'
            : isAdmin
              ? `الطلبات والاستفسارات الجديدة (${unreadCount})`
              : `الإشعارات والتنبيهات (${unreadCount})`
        }
      >
        <span className="bell-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
        </span>

        {unreadCount > 0 && (
          <>
            {/* Pulsing signal radar wave ("يبان زي الإشارة") */}
            <span className="bell-signal-wave" aria-hidden="true"></span>
            <span className="bell-badge" aria-label={`${unreadCount} إشعارات جديدة`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Modern Notifications Dropdown Panel */}
      {isOpen && (
        <>
          <div
            className="notif-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="notif-dropdown-panel" role="dialog" aria-label="قائمة التنبيهات">
            <div className="notif-dropdown-header">
              <div className="notif-header-title">
                <i className="fa-solid fa-bell"></i>
                <strong>مركز الإشعارات</strong>
                {unreadCount > 0 && (
                  <span className="notif-unread-count-pill">{unreadCount} جديد</span>
                )}
              </div>
              <div className="notif-header-actions">
                {!isAdmin && !isGuest && unreadCount > 0 && (
                  <button
                    type="button"
                    className="notif-mark-all-btn"
                    onClick={handleMarkAllRead}
                    title="تحديد جميع التنبيهات والردود كمقروءة"
                  >
                    <i className="fa-solid fa-check-double"></i>
                    تحديد الكل كمقروء
                  </button>
                )}
                <button
                  type="button"
                  className="notif-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="إغلاق"
                  title="إغلاق"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

          <div className="notif-dropdown-body">
            {/* STUDENT & GUEST VIEW */}
            {!isAdmin && (
              <>
                {studentItems.length > 0 ? (
                  <div className="notif-items-list">
                    {studentItems.map((item) => {
                      const isUnread = !item.read;
                      const trackName = item.trackId ? (getCourse(item.trackId)?.title || 'المسار التدريبي') : null;
                      const textSnippet = item.text && item.text.length > 80 ? `${item.text.slice(0, 80)}...` : item.text;

                      let iconClass = 'fa-solid fa-bell';
                      if (item.type === 'inquiry_reply') iconClass = 'fa-solid fa-comments';
                      else if (item.type === 'course_approved') iconClass = 'fa-solid fa-circle-check';
                      else if (item.type === 'topup_approved') iconClass = 'fa-solid fa-coins';
                      else if (item.type === 'welcome') iconClass = 'fa-solid fa-rocket';

                      return (
                        <div
                          key={item.id}
                          className={`notif-item-card ${isUnread ? 'is-unread' : 'is-read'}`}
                          onClick={() => handleStudentItemClick(item)}
                        >
                          <div className="notif-item-top">
                            <span className="notif-track-tag">
                              <i className={iconClass}></i>
                              {trackName || (item.type === 'course_approved' ? 'تفعيل كورس' : item.type === 'topup_approved' ? 'شحن رصيد' : 'أكاديمية خطوة')}
                            </span>
                            <span className="notif-time-tag">
                              {fmt(item.date)}
                            </span>
                          </div>

                          <div className="notif-item-title-row">
                            <div className="notif-avatar-icon">
                              <i className={iconClass}></i>
                            </div>
                            <div className="notif-item-content">
                              <strong className="notif-sender-title">
                                {item.title}
                                {isUnread && <span className="notif-new-dot" title="غير مقروء"></span>}
                              </strong>
                              <p className="notif-reply-excerpt">
                                {textSnippet}
                              </p>
                              {item.userQuestion && (
                                <span className="notif-original-q">
                                  سؤالك: {item.userQuestion.length > 40 ? `${item.userQuestion.slice(0, 40)}...` : item.userQuestion}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="notif-item-footer">
                            <button
                              type="button"
                              className="notif-detail-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStudentItemClick(item);
                              }}
                            >
                              <span>{item.type === 'course_approved' ? 'مشاهدة الكورس' : 'عرض التفاصيل'}</span>
                              <i className="fa-solid fa-arrow-left"></i>
                            </button>
                            {isUnread && (
                              <button
                                type="button"
                                className="notif-read-btn-chip"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.kind === 'inquiry') {
                                    if (markSingleInquiryAsRead) markSingleInquiryAsRead(item.originalId);
                                  } else {
                                    if (markSingleNotificationAsRead) markSingleNotificationAsRead(item.originalId);
                                  }
                                }}
                                title="تحديد كمقروء"
                              >
                                تحديد كمقروء
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notif-empty-state">
                    <div className="notif-empty-icon"><i className="fa-regular fa-bell"></i></div>
                    <div className="notif-empty-title">لا توجد إشعارات جديدة</div>
                    <p className="notif-empty-desc">
                      {isGuest
                        ? 'عند تسجيل الدخول ومتابعة دراستك، ستصلك كافة التنبيهات والردود هنا فوراً.'
                        : 'عند وجود رد على استفساراتك أو تفعيل اشتراكاتك ورصيدك، ستصلك كافة التنبيهات هنا فوراً.'}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ADMIN VIEW */}
            {isAdmin && (
              <>
                {(adminPendingLeads.length > 0 || adminPendingSubs.length > 0) ? (
                  <div className="notif-items-list">
                    {adminPendingLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="notif-item-card is-unread"
                        onClick={() => handleAdminGoTo('leads')}
                      >
                        <div className="notif-item-top">
                          <span className="notif-track-tag" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
                            <i className="fa-solid fa-headset"></i> استفسار جديد
                          </span>
                          <span className="notif-time-tag">{fmt(lead.date)}</span>
                        </div>
                        <div className="notif-item-title-row">
                          <div className="notif-item-content">
                            <strong className="notif-sender-title">{lead.name || 'طالب جديد'}</strong>
                            <p className="notif-reply-excerpt">«{lead.message || 'طلب استفسار عن مسار'}»</p>
                          </div>
                        </div>
                        <div className="notif-item-footer">
                          <button type="button" className="notif-detail-link">
                            <span>الرد على الاستفسار</span>
                            <i className="fa-solid fa-arrow-left"></i>
                          </button>
                        </div>
                      </div>
                    ))}

                    {adminPendingSubs.map((sub) => (
                      <div
                        key={sub.id}
                        className="notif-item-card is-unread"
                        onClick={() => handleAdminGoTo('sub_requests')}
                      >
                        <div className="notif-item-top">
                          <span className="notif-track-tag" style={{ color: 'var(--cyan)', background: 'rgba(43, 185, 211, 0.12)' }}>
                            <i className="fa-solid fa-receipt"></i> {sub.type === 'topup' ? 'طلب شحن محفظة' : 'طلب اشتراك كورس'}
                          </span>
                          <span className="notif-time-tag">{fmt(sub.date)}</span>
                        </div>
                        <div className="notif-item-title-row">
                          <div className="notif-item-content">
                            <strong className="notif-sender-title">{sub.userName} ({sub.amount || sub.price} ج.م)</strong>
                            <p className="notif-reply-excerpt">عبر ({sub.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}) - المحول منه: {sub.sender}</p>
                          </div>
                        </div>
                        <div className="notif-item-footer">
                          <button type="button" className="notif-detail-link">
                            <span>مراجعة وتفعيل الطلب</span>
                            <i className="fa-solid fa-arrow-left"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="notif-empty-state">
                    <div className="notif-empty-icon"><i className="fa-solid fa-check-double"></i></div>
                    <div className="notif-empty-title">كل الطلبات والاستفسارات تمت معالجتها!</div>
                    <p className="notif-empty-desc">لا توجد طلبات اشتراك أو استفسارات معلقة في انتظار الرد.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="notif-dropdown-footer">
            <button
              type="button"
              className="notif-footer-action"
              onClick={() => {
                setIsOpen(false);
                if (isAdmin) {
                  window.location.hash = '#/admin';
                  if (setAtab) setAtab('leads');
                } else if (user) {
                  window.location.hash = '#/dashboard';
                  if (setDtab) setDtab('notifications');
                } else {
                  window.location.hash = '#/auth/login';
                }
              }}
            >
              <span>{isAdmin ? 'فتح إدارة الاستفسارات' : user ? 'عرض كل الإشعارات في الداشبورد' : 'تسجيل الدخول'}</span>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          </div>
        </div>
      </>
      )}
    </div>
  );
}

export default NotificationBell;
