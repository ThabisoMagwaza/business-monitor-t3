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
import Link from 'next/link';

type HeaderProps = {
  isAdmin: boolean;
};

function HeaderStyled({ isAdmin }: HeaderProps) {
  return (
    <OuterWrapper>
      <Wrapper>
        <LogoWrapper href="/">
          <Logo>Business Monitor</Logo>
        </LogoWrapper>

        <ActionsWrapper>
          <SignedOut>
            <SignInButton>Sign In</SignInButton>
          </SignedOut>
          {isAdmin && <Link href="/add-users">Manage</Link>}
          <SignedIn>
            <UserButton />
          </SignedIn>
        </ActionsWrapper>
      </Wrapper>
    </OuterWrapper>
  );
}

const LogoWrapper = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

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

export default HeaderStyled;
