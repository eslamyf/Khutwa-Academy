import React, { useState, useRef, useEffect } from 'react';
import { useKhutwa } from '../../hooks';
import { fmt } from '../../utils';

export function NotificationBell() {
  const {
    user,
    db,
    unreadRepliesCount,
    pendingLeadsCount,
    pendingSubCount,
    setDtab,
    setAtab,
    markInquiriesAsRead,
    markSingleInquiryAsRead,
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
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const unreadCount = isAdmin ? (pendingLeadsCount + pendingSubCount) : unreadRepliesCount;

  // Prepare notifications list for Student
  const studentInquiries = (db.leads || []).filter((l) => {
    const isUserLead = l.userId === user.id ||
      (user.phone && l.phone === user.phone) ||
      (user.email && l.userEmail === user.email);
    return isUserLead && l.reply;
  }).sort((a, b) => (b.repliedAt || b.date) - (a.repliedAt || a.date));

  // Prepare notifications list for Admin
  const adminPendingLeads = (db.leads || []).filter((l) => l.status === 'new' || !l.reply);
  const adminPendingSubs = (db.subRequests || []).filter((s) => s.status === 'pending');

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markInquiriesAsRead();
  };

  const handleOpenDetail = (leadId) => {
    markSingleInquiryAsRead(leadId);
    setIsOpen(false);
    window.location.hash = '#/dashboard';
    setDtab('inquiries');
  };

  const handleAdminGoTo = (tab) => {
    setIsOpen(false);
    window.location.hash = '#/admin';
    setAtab(tab);
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className={`bell-btn ${isOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={handleToggle}
        aria-label="مركز الإشعارات والتنبيهات"
        aria-expanded={isOpen}
        title={isAdmin ? `الاستفسارات والطلبات الجديدة (${unreadCount})` : `الإشعارات والردود (${unreadCount})`}
      >
        <span className="bell-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
        </span>
        {unreadCount > 0 && (
          <span className="bell-badge" aria-label={`${unreadCount} إشعارات جديدة`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Notifications Dropdown Panel */}
      {isOpen && (
        <div className="notif-dropdown-panel" role="dialog" aria-label="قائمة التنبيهات">
          <div className="notif-dropdown-header">
            <div className="notif-header-title">
              <i className="fa-solid fa-bell"></i>
              <strong>الإشعارات والتنبيهات</strong>
              {unreadCount > 0 && <span className="notif-unread-count-pill">{unreadCount} جديد</span>}
            </div>
            {!isAdmin && unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-btn"
                onClick={handleMarkAllRead}
                title="تحديد جميع الردود كمقروءة"
              >
                <i className="fa-solid fa-check-double"></i>
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="notif-dropdown-body">
            {/* STUDENT VIEW */}
            {!isAdmin && (
              <>
                {studentInquiries.length > 0 ? (
                  <div className="notif-items-list">
                    {studentInquiries.map((inq) => {
                      const isUnread = !inq.readByStudent;
                      const trackName = getCourse(inq.track)?.title || 'المسار التدريبي';
                      const replySnippet = inq.reply.length > 75 ? `${inq.reply.slice(0, 75)}...` : inq.reply;

                      return (
                        <div
                          key={inq.id}
                          className={`notif-item-card ${isUnread ? 'is-unread' : 'is-read'}`}
                          onClick={() => handleOpenDetail(inq.id)}
                        >
                          <div className="notif-item-top">
                            <span className="notif-track-tag">
                              <i className="fa-solid fa-graduation-cap"></i>
                              {trackName}
                            </span>
                            <span className="notif-time-tag">
                              {fmt(inq.repliedAt || inq.date)}
                            </span>
                          </div>

                          <div className="notif-item-title-row">
                            <div className="notif-avatar-icon">
                              <i className="fa-solid fa-comments"></i>
                            </div>
                            <div className="notif-item-content">
                              <strong className="notif-sender-title">
                                رد إدارة أكاديمية خطوة
                                {isUnread && <span className="notif-new-dot" title="غير مقروء"></span>}
                              </strong>
                              <p className="notif-reply-excerpt">
                                «{replySnippet}»
                              </p>
                              {inq.message && (
                                <span className="notif-original-q">
                                  سؤالك كان: {inq.message.length > 40 ? `${inq.message.slice(0, 40)}...` : inq.message}
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
                                handleOpenDetail(inq.id);
                              }}
                            >
                              <span>عرض التفاصيل والرد الكامل</span>
                              <i className="fa-solid fa-arrow-left"></i>
                            </button>
                            {isUnread && (
                              <button
                                type="button"
                                className="notif-read-btn-chip"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markSingleInquiryAsRead(inq.id);
                                }}
                                title="تحديد كمقروء دون الانتقال"
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
                    <div className="notif-empty-icon">🔔</div>
                    <div className="notif-empty-title">لا توجد إشعارات جديدة حالياً</div>
                    <p className="notif-empty-desc">
                      عند إرسال أي استفسار والرد عليه من الإدارة، ستظهر لك إشعارات الردود ومقتطفاتها هنا فوراً.
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
                    <div className="notif-empty-icon">✓</div>
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
                  setAtab('leads');
                } else {
                  window.location.hash = '#/dashboard';
                  setDtab('inquiries');
                }
              }}
            >
              <span>{isAdmin ? 'فتح إدارة الاستفسارات' : 'عرض كل استفساراتي والردود'}</span>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
