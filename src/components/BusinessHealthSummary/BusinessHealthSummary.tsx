'use client';
import * as React from 'react';
import styled from 'styled-components';

import MaxWidthWrapper from '../MaxWidthWrapper';
import Heading1 from '../Heading1';

function BusinessHealthSummary() {
  return (
    <Wrapper as="section">
      <Heading1>Nambitha 2.0</Heading1>
    </Wrapper>
  );
}

const Wrapper = styled(MaxWidthWrapper)``;

export default BusinessHealthSummary;
