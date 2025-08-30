import { getUserInfo } from '~/app/db-helpers';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '../ui/button';
import { BarChart3 } from 'lucide-react';

async function Header() {
  const user = await getUserInfo();

  const isAdmin = user?.isAdmin ?? false;

  return (
    <header>
      <div className="flex items-center justify-between py-6 max-w-[calc(1000px+1rem)] mx-auto px-4">
        <Link
          href="/"
          prefetch
          className="font-bold decoration-none text-inherit flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">BusinessMonitor</span>
        </Link>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
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
