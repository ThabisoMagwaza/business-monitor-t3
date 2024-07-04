'use client';
import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import * as RadixToast from '@radix-ui/react-toast';
import { ToastContext } from '~/app/context/ToastProvider';

const Toast = () => {
  const context = React.useContext(ToastContext);

  return (
    <RadixToast.Provider swipeDirection="right">
      <ToastRoot open={context?.open} onOpenChange={context?.setOpen}>
        <Title>{context?.message.title}</Title>
        <Description asChild>
          <p>{context?.message.description}</p>
        </Description>
        <Action asChild altText="Goto schedule to undo">
          <Button>X</Button>
        </Action>
      </ToastRoot>
      <ToastViewport className="ToastViewport" />
    </RadixToast.Provider>
  );
};

const Hide = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const SlideIn = keyframes`
  from {
    transform: translateX(calc(100% + var(--viewport-padding)));
  }
  to {
    transform: translateX(0);
  }
`;

const ToastViewport = styled(RadixToast.Viewport)`
  --viewport-padding: 25px;
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: var(--viewport-padding);
  gap: 10px;
  width: 390px;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
`;

const ToastRoot = styled(RadixToast.Root)`
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  padding: 15px;
  display: grid;
  grid-template-areas: 'title action' 'description action';
  grid-template-columns: auto max-content;
  column-gap: 15px;
  align-items: center;

  &[data-state='open'] {
    animation: ${SlideIn} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[data-state='closed'] {
    animation: ${Hide} 100ms ease-in;
  }
`;

const Title = styled(RadixToast.Title)`
  grid-area: title;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--slate-12);
  font-size: 15px;
`;

const Description = styled(RadixToast.Description)`
  grid-area: description;
  margin: 0;
  color: var(--slate-11);
  font-size: 13px;
  line-height: 1.3;
`;

const Action = styled(RadixToast.Action)`
  grid-area: action;
`;

const Button = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
`;

export default Toast;
