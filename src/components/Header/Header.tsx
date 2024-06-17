'use client';
import * as React from 'react';
import styled from 'styled-components';

import {
  SignInButton as ClerkSignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

import { COLORS } from '~/lib/Colors';

import MaxWidthWrapper from '../MaxWidthWrapper';

function Header() {
  return (
    <OuterWrapper>
      <Wrapper>
        <Logo>Business Monitor</Logo>

        <SignedOut>
          <SignInButton>Sign In</SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </Wrapper>
    </OuterWrapper>
  );
}

const SignInButton = styled(ClerkSignInButton)`
  border: none;
  font-size: 700;
  background: none;
`;

const Logo = styled.p`
  font-size: 1rem;
  font-weight: 700;
`;

const Wrapper = styled(MaxWidthWrapper)`
  padding-top: 12px;
  padding-bottom: 12px;

  display: flex;
  justify-content: space-between;
`;

const OuterWrapper = styled.header`
  border-bottom: 1px solid ${COLORS.Gray86};
`;

export default Header;
