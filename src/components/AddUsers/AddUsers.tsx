'use client';
import * as React from 'react';

import styled from 'styled-components';

import { addUser } from '~/app/actions';

import Heading1 from '~/components/Heading1';
import MaxWidthWrapper from '~/components/MaxWidthWrapper';

export type User = {
  id: string;
  username: string | null;
};

type AddUsersProps = {
  users: User[] | undefined;
};

function AddUsers({ users }: AddUsersProps) {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const addNewUser = addUser.bind(null, selectedUser);

  const handleUserSelect = (id: string) => {
    const user = users?.find((user) => user.id === id);

    if (!user) {
      return;
    }

    setSelectedUser(user);
  };

  return (
    <Wrapper>
      <HeadingWrapper>
        <Heading1>Add User</Heading1>
      </HeadingWrapper>

      <Form action={addNewUser}>
        <select
          onChange={(e) => handleUserSelect(e.target.value)}
          defaultValue=""
        >
          <option disabled value="">
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
