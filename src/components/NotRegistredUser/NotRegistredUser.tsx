'use client';
import * as React from 'react';
import styled from 'styled-components';
import MaxWidthWrapper from '../MaxWidthWrapper';
import Link from 'next/link';

function NotRegistredUser() {
  return (
    <Wrapper>
      <InnerWrapper>
        <p>You have not been registred as a user for a business</p>
        <LinksWrapper>
          <Link href="/register-business">Register business</Link>
          {/* <Link href="/add-user">Add a user</Link> */}
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
