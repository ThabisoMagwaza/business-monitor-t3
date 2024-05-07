import * as React from 'react';
import styled from 'styled-components';

type HeadingProps = {
  children: React.ReactNode;
};

function Heading1({ children }: HeadingProps) {
  return <Heading>{children}</Heading>;
}

const Heading = styled.h1``;

export default Heading1;
