import { getUserInfo } from '~/app/db-helpers';
import HeaderStyled from './HeaderStyled';

async function Header() {
  const user = await getUserInfo();

  return <HeaderStyled isAdmin={user?.isAdmin ?? false} />;
}

export default Header;
