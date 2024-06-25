'use client';
import * as React from 'react';
import styled from 'styled-components';
import MaxWidthWrapper from '../MaxWidthWrapper';
import Link from 'next/link';

function NotRegistredUser() {
  return (
    <Wrapper>
      <InnerWrapper>
        <p>
          You have not been registred as a user for a business. Please register
          a new business or request your business mananger to add you to their
          business.
        </p>
        <LinksWrapper>
          <Link href="/register-business">Register business</Link>
        </LinksWrapper>
      </InnerWrapper>
    </Wrapper>
  );
}

const LinksWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const Wrapper = styled(MaxWidthWrapper)`
  height: 100%;
  display: grid;
  place-items: center;
  text-align: center;
`;

const InnerWrapper = styled.div``;

export default NotRegistredUser;
