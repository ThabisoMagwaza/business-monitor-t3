import { getUserInfo } from '~/app/db-helpers';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

async function Header() {
  const user = await getUserInfo();

  const isAdmin = user?.isAdmin ?? false;

  return (
    <header className="border-b border-zinc-600">
      <div className="flex justify-between py-3 my-0 mx-auto px-4 max-w-[calc(1000px+1rem)]">
        <Link href="/" className="font-bold decoration-none text-inherit">
          Business Monitor
        </Link>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton>Sign In</SignInButton>
          </SignedOut>
          {isAdmin && <Link href="/add-users">Manage</Link>}
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default Header;
