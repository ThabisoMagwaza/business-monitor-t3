'use client';
import * as React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import './styles.css';
import { ToastContext } from '~/app/context/ToastProvider';

const Toast = () => {
  const context = React.useContext(ToastContext);

  return (
    <RadixToast.Provider swipeDirection="right">
      <RadixToast.Root
        className="ToastRoot"
        open={context?.open}
        onOpenChange={context?.setOpen}
      >
        <RadixToast.Title className="ToastTitle">
          {context?.message.title}
        </RadixToast.Title>
        <RadixToast.Description asChild>
          <p>{context?.message.description}</p>
        </RadixToast.Description>
        <RadixToast.Action
          className="ToastAction"
          asChild
          altText="Goto schedule to undo"
        >
          <button className="Button small green">Undo</button>
        </RadixToast.Action>
      </RadixToast.Root>
      <RadixToast.Viewport className="ToastViewport" />
    </RadixToast.Provider>
  );
};

export default Toast;
