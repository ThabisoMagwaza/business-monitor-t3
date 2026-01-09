import { UserPlus, Link, CheckIcon } from 'lucide-react';
import Page from '~/components/Page/Page';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import AddUserDialog from '~/components/AddUserDialog/AddUserDialog';
import ConnectYocoDialog from '~/components/ConnectYocoDialog/ConnectYocoDialog';
import { getIntegrationSetting } from '~/server/adapters/integrationSettings/queries';
import { getUserAction } from '../actions/users';
import { redirect } from 'next/navigation';

export default async function ManagePage() {
  const user = await getUserAction();
  if (!user?.isAdmin) {
    redirect('/');
  }

  const yocoApiKey = await getIntegrationSetting(
    user.id,
    user.businessId,
    'yocoApiKey'
  );

  return (
    <Page className="flex flex-col md:flex-row gap-4 md:items-start pt-4">
      <Card className="md:flex-1">
        <CardHeader className="flex items-center gap-2">
          <UserPlus />
          Add User
        </CardHeader>
        <CardContent>
          <AddUserDialog>
            <Button>Add User</Button>
          </AddUserDialog>
        </CardContent>
      </Card>
      <Card className="md:flex-1">
        <CardHeader className="flex items-center gap-2">
          <Link />
          Connect Yoco account
        </CardHeader>
        <CardContent>
          {yocoApiKey ? (
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <p>Yoco account connected</p>
            </div>
          ) : (
            <ConnectYocoDialog>
              <Button>Connect</Button>
            </ConnectYocoDialog>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}
