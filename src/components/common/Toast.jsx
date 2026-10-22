import React from 'react';
import { useKhutwa } from '../../hooks';

export function Toast() {
  const { toastMsg } = useKhutwa();

  return (
    <div id="toast" className={toastMsg ? 'on' : ''}>
      {toastMsg}
    </div>
  );
}

export default Toast;
