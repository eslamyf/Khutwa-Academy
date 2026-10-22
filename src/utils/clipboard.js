export const copyToClipboard = (text, label, onCopied) => {
  return navigator.clipboard.writeText(text).then(() => {
    if (typeof onCopied === 'function') {
      onCopied(`تم نسخ ${label}: ${text}`);
    }
  });
};

export default copyToClipboard;
