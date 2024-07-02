'use client';
import * as React from 'react';

type ToastContextType = {
  open: boolean;
  setOpen: (state: boolean) => void;
  message: {
    title: string;
    description: string;
  };
  showToast: (message: { title: string; description: string }) => void;
};

export const ToastContext = React.createContext<ToastContextType | null>(null);

function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const messageRef = React.useRef({
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

      window.setTimeout(() => setOpen(false), 5000);
    }, 100);
  };

  return (
    <ToastContext.Provider
      value={{
        open,
        message: messageRef.current,
        setOpen,
        showToast: React.useCallback(
          (message: { title: string; description: string }) => {
            messageRef.current = message;
            showToast();
          },
          []
        ),
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toastContext = React.useContext(ToastContext);

  if (!toastContext) {
    throw new Error('useToast must be inside a <ToastContext.Provider>');
  }

  return toastContext;
}

export default ToastContextProvider;
