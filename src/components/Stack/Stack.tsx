'use client';
import * as React from 'react';
import styled from 'styled-components';

type StackProps = {
  orientation?: 'horizontal' | 'vertical';
  gap?: number;
  children: React.ReactNode;
};

function Stack({ orientation = 'vertical', gap = 16, children }: StackProps) {
  return (
    <Wrapper
      style={
        {
          '--direction': (orientation === 'vertical' && 'column') || 'row',
          '--gap': `${gap}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: var(--direction);
  gap: var(--gap);
`;

export default Stack;
