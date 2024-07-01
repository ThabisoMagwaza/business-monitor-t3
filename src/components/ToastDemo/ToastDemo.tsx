'use client';
import * as React from 'react';
import { ToastContext } from '~/app/context/ToastProvider';

const ToastDemo = () => {
  const context = React.useContext(ToastContext);

  return (
    <button
      className="Button large violet"
      onClick={() =>
        context?.showToast({
          title: 'Look here!',
          description: 'Something happened',
        })
      }
    >
      Add to calendar
    </button>
  );
};

export default ToastDemo;
