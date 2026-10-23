export const gid = (p) => p + Math.random().toString(36).slice(2, 9);

export const fmt = (t) => new Date(t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });

export const totTime = (lessons = []) => {
  const m = lessons.reduce((s, l) => s + (+l.min || 0), 0);
  return m >= 60 ? Math.floor(m / 60) + ' ساعة' + (m % 60 ? ' و' + (m % 60) + ' دقيقة' : '') : m + ' دقيقة';
};

export const getUserInitials = (name) => {
  if (!name || typeof name !== 'string') return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) {
    return parts[0].slice(0, 2);
  }
  return `${parts[0].charAt(0)}.${parts[1].charAt(0)}`;
};

export default {
  gid,
  fmt,
  totTime,
  getUserInitials
};
