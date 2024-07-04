'use client';
import * as React from 'react';
import { useFormStatus } from 'react-dom';
import styled from 'styled-components';

function SubmitButton({
  children,
  loadingText,
}: {
  children: React.ReactNode;
  loadingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Wrapper>
      {pending && <span>{loadingText}</span>}
      <ActionButton disabled={pending}>{children}</ActionButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 16px;
  align-self: flex-end;

  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled.button`
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 10px;
  color: black;

  border-bottom: 1px solid;
  border-radius: 16px;
  padding-inline: 16px;
  padding-block: 8px;

  &:disabled {
    opacity: 0.5;
  }
`;

export default SubmitButton;
