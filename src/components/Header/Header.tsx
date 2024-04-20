'use client';
import * as React from 'react';
import styled from 'styled-components';

import { COLORS } from '~/lib/Colors';

import MaxWidthWrapper from '../MaxWidthWrapper';

function Header() {
  return (
    <OuterWrapper>
      <Wrapper>
        <Logo>Business Monitor</Logo>
      </Wrapper>
    </OuterWrapper>
  );
}

const Logo = styled.p`
  font-size: 1rem;
  font-weight: 700;
`;

const Wrapper = styled(MaxWidthWrapper)`
  padding-top: 12px;
  padding-bottom: 12px;
`;

const OuterWrapper = styled.header`
  border-bottom: 1px solid ${COLORS.Gray86};
`;

export default Header;
