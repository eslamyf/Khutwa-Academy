export const ytid = (u) => {
  const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m && m[1];
};

export default ytid;
