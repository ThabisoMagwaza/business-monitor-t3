'use client';
import * as React from 'react';

import styled from 'styled-components';
import MaxWidthWrapper from '../MaxWidthWrapper';

function SignedOutPage() {
  return (
    <Wrapper as="main">
      <p>Please sign in to know the health of your business</p>
    </Wrapper>
  );
}

const Wrapper = styled(MaxWidthWrapper)`
  height: 100%;
  display: grid;
  place-items: center;
  text-align: center;
`;

export default SignedOutPage;
