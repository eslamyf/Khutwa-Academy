/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from 'react';
import { DB_KEY, SESSION_KEY, initialSeed } from '../constants';
import { LS, gid } from '../utils';

export const KhutwaContext = createContext(null);

export function KhutwaProvider({ children }) {
  const [db, setDb] = useState(() => {
    try {
      const raw = LS.get(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.subRequests) parsed.subRequests = [];
        if (!parsed.settings) parsed.settings = {};
        if (!parsed.settings.vodafone) parsed.settings.vodafone = '01012345678';
        if (!parsed.settings.instapay) parsed.settings.instapay = 'khutwa@instapay';
        if (!parsed.courses || !parsed.courses.length) {
          parsed.courses = initialSeed().courses;
        } else {
          const seed = initialSeed();
          parsed.courses = seed.courses.map((sc) => {
            const ex = parsed.courses.find((c) => c.id === sc.id);
            if (!ex) return sc;
            const updatedLessons = sc.lessons.map((sl, idx) => {
              const el = ex.lessons && ex.lessons[idx];
              let url = (el && el.url) ? el.url : sl.url;
              if (url && (url.includes('R6Ygwllc_a8') || !url.trim())) {
                url = sl.url;
              }
              return {
                ...sl,
                url
              };
            });
            const price = (ex.price === 1500 || ex.price === 1200 || !ex.price) ? sc.price : ex.price;
            const instructor = ex.instructor || sc.instructor;
            const instructorRole = ex.instructorRole || sc.instructorRole;
            const img = (ex.img && ex.img.trim()) ? ex.img : sc.img;
            const instructorAvatar = ex.instructorAvatar || sc.instructorAvatar;
            return { ...ex, price, lessons: updatedLessons, instructor, instructorRole, img, instructorAvatar };
          });
        }
        if (parsed.subRequests && parsed.subRequests.length) {
          parsed.subRequests = parsed.subRequests.map((s) => {
            const course = parsed.courses.find((c) => c.id === s.courseId);
            if (course && (s.price === 1500 || s.price === 1200)) {
              return { ...s, price: course.price };
            }
            return s;
          });
        }
        if (parsed.leads && parsed.leads.length) {
          parsed.leads = parsed.leads.map((l) => {
            if (l.reply && !l.readTimestamp) {
              return { ...l, readByStudent: false };
            }
            return l;
          });
        }
        LS.set(DB_KEY, JSON.stringify(parsed));
        return parsed;
      }
    } catch {
      return initialSeed();
    }
    return initialSeed();
  });

  const [sid, setSid] = useState(() => LS.get(SESSION_KEY));
  const [hash, setHash] = useState(() => window.location.hash || '');
  const [toastMsg, setToastMsg] = useState('');
  const [dialogContent, setDialogContent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dashboards internal state
  const [dtab, setDtab] = useState('courses');
  const [atab, setAtab] = useState('ov');
  const [aedit, setAedit] = useState(null);
  const [pend, setPend] = useState(null);

  const saveDb = (next) => {
    setDb(next);
    LS.set(DB_KEY, JSON.stringify(next));
  };

  const showToast = (m) => {
    setToastMsg(m);
    setTimeout(() => {
      setToastMsg('');
    }, 2600);
  };

  const currentUser = () => {
    const u = db.users.find((x) => x.id === sid);
    return u && u.status !== 'blocked' ? u : null;
  };

  const getCourse = (id) => db.courses.find((c) => c.id === id);
  const getEnrollment = (u, cid) => u && db.enr.find((e) => e.u === u.id && e.c === cid);
  const getPendingSub = (u, cid) => u && (db.subRequests || []).find((s) => s.userId === u.id && s.courseId === cid && s.status === 'pending');

  // Theme toggle
  const toggleTheme = () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    LS.set('khutwa-theme', next);
  };

  // Copy helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`تم نسخ ${label}: ${text}`);
    });
  };

  // Listen to hash changes and close mobile menu
  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || '');
      setMobileMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Update body lock class when app layer is open
  const isAppOpen = hash.startsWith('#/');
  useEffect(() => {
    if (isAppOpen) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  }, [isAppOpen]);

  // Auth actions
  const registerUser = (name, email, pass) => {
    email = email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) return 'الإيميل ده مسجل قبل كده';
    const u = {
      id: gid('u'),
      name: name.trim(),
      email,
      pass,
      role: 'student',
      balance: 0,
      phone: '',
      profile: {},
      status: 'active',
      created: Date.now()
    };
    const nextDb = { ...db, users: [...db.users, u] };
    saveDb(nextDb);
    setSid(u.id);
    LS.set(SESSION_KEY, u.id);
    return null;
  };

  const loginUser = (email, pass) => {
    const u = db.users.find((x) => x.email === email.trim().toLowerCase() && x.pass === pass);
    if (!u) return 'الإيميل أو كلمة السر غلط';
    if (u.status === 'blocked') return 'الحساب موقوف، تواصل معنا';
    setSid(u.id);
    LS.set(SESSION_KEY, u.id);
    return null;
  };

  const logoutUser = () => {
    setSid(null);
    LS.del(SESSION_KEY);
    window.location.hash = '';
    showToast('تم تسجيل الخروج');
  };

  const user = currentUser();
  const pendingSubCount = (db.subRequests || []).filter((s) => s.status === 'pending').length;
  const pendingLeadsCount = (db.leads || []).filter((l) => l.status === 'new' || !l.reply).length;

  const unreadRepliesCount = user ? (db.leads || []).filter((l) => {
    const isUserLead = l.userId === user.id ||
      (user.phone && l.phone === user.phone) ||
      (user.email && l.userEmail === user.email);
    return isUserLead && l.reply && !l.readByStudent;
  }).length : 0;

  const markInquiriesAsRead = () => {
    if (!user) return;
    let changed = false;
    const updatedLeads = (db.leads || []).map((l) => {
      const isUserLead = l.userId === user.id ||
        (user.phone && l.phone === user.phone) ||
        (user.email && l.userEmail === user.email);
      if (isUserLead && l.reply && !l.readByStudent) {
        changed = true;
        return { ...l, readByStudent: true, readTimestamp: Date.now() };
      }
      return l;
    });
    if (changed) {
      saveDb({ ...db, leads: updatedLeads });
    }
  };

  const markSingleInquiryAsRead = (leadId) => {
    if (!user || !leadId) return;
    let changed = false;
    const updatedLeads = (db.leads || []).map((l) => {
      if (l.id === leadId && !l.readByStudent) {
        changed = true;
        return { ...l, readByStudent: true, readTimestamp: Date.now() };
      }
      return l;
    });
    if (changed) {
      saveDb({ ...db, leads: updatedLeads });
    }
  };

  const value = {
    db,
    setDb,
    saveDb,
    sid,
    setSid,
    hash,
    setHash,
    toastMsg,
    showToast,
    dialogContent,
    setDialogContent,
    mobileMenuOpen,
    setMobileMenuOpen,
    dtab,
    setDtab,
    atab,
    setAtab,
    aedit,
    setAedit,
    pend,
    setPend,
    user,
    isAppOpen,
    pendingSubCount,
    pendingLeadsCount,
    unreadRepliesCount,
    markInquiriesAsRead,
    markSingleInquiryAsRead,
    getCourse,
    getEnrollment,
    getPendingSub,
    toggleTheme,
    copyToClipboard,
    registerUser,
    loginUser,
    logoutUser
  };

  return (
    <KhutwaContext.Provider value={value}>
      {children}
    </KhutwaContext.Provider>
  );
}

export default KhutwaContext;
