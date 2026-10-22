import { useContext } from 'react';
import { KhutwaContext } from '../context/KhutwaContext.jsx';

export const useKhutwa = () => {
  const context = useContext(KhutwaContext);
  if (!context) {
    throw new Error('useKhutwa must be used within a KhutwaProvider');
  }
  return context;
};

export default useKhutwa;
