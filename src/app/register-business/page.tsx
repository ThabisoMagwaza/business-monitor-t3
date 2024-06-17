'use client';
import * as React from 'react';

import styled from 'styled-components';

import { addBusiness } from '~/app/actions';

import Heading1 from '~/components/Heading1';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';

export default function Page() {
  return (
    <Wrapper>
      <HeadingWrapper>
        <Heading1>Register Business</Heading1>
      </HeadingWrapper>

      <Form action={addBusiness}>
        <FormField>
          <label htmlFor="name">Business Name:</label>
          <input name="name" id="name" />
        </FormField>
        <button>Register</button>
      </Form>
    </Wrapper>
  );
}

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const HeadingWrapper = styled.div`
  text-align: center;
`;

const Wrapper = styled(MaxWidthWrapper)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
