export const ytid = (u) => {
  if (!u) return '';
  const str = String(u);
  if (str.includes('R6Ygwllc_a8')) {
    return 'X1ulCwyhCVM';
  }
  const m = str.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (m && m[1] === 'R6Ygwllc_a8') {
    return 'X1ulCwyhCVM';
  }
  return (m && m[1]) || '';
};

export default ytid;
