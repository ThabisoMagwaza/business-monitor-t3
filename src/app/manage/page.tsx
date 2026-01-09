import { UserPlus, Link } from 'lucide-react';
import Page from '~/components/Page/Page';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import AddUserDialog from '~/components/AddUserDialog/AddUserDialog';
import ConnectYocoDialog from '~/components/ConnectYocoDialog/ConnectYocoDialog';

export default async function ManagePage() {
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
          <ConnectYocoDialog>
            <Button>Connect</Button>
          </ConnectYocoDialog>
        </CardContent>
      </Card>
    </Page>
  );
}
