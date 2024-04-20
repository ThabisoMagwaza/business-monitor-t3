'use client';
import styled from 'styled-components';

const MaxWidthWrapper = styled.div`
  --padding: 16px;
  padding-left: var(--padding);
  padding-right: var(--padding);

  max-width: calc(1000px + calc(var(--padding) * 2));
  margin: 0 auto;
`;

export default MaxWidthWrapper;
