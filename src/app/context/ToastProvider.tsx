'use client';
import * as React from 'react';

type ToastContextType = {
  open: boolean;
  setOpen: (state: boolean) => void;
  message: {
    title: string;
    description: string;
  };
  setMessage: (message: { title: string; description: string }) => void;
  showToast: (message: { title: string; description: string }) => void;
};

export const ToastContext = React.createContext<ToastContextType | null>(null);

function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState({
    title: '',
    description: '',
  });

  const timerRef = React.useRef(0);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const showToast = () => {
    setOpen(false);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setOpen(true);

      window.setTimeout(() => setOpen(false), 2000);
    }, 100);
  };

  return (
    <ToastContext.Provider
      value={{
        open,
        message,
        setMessage,
        setOpen,
        showToast: (message: { title: string; description: string }) => {
          setMessage(message);
          showToast();
        },
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export default ToastContextProvider;
