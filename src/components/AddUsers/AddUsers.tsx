'use client';
import * as React from 'react';

import styled from 'styled-components';

import { addBusiness } from '~/app/actions';

import Heading1 from '~/components/Heading1';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';

type AddUsersProps = {
  users: { id: string; username: string | null }[] | undefined;
};

function AddUsers({ users }: AddUsersProps) {
  return (
    <Wrapper>
      <HeadingWrapper>
        <Heading1>Add User</Heading1>
      </HeadingWrapper>

      <Form action={addBusiness}>
        <select>
          <option disabled selected>
            Select a user to add
          </option>
          {Array.isArray(users) &&
            users.map(({ id, username }) => (
              <option key={id} value={id}>
                {username}
              </option>
            ))}
        </select>
        <button>Add</button>
      </Form>
    </Wrapper>
  );
}

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

export default AddUsers;
