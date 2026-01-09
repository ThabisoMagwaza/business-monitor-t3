'use client';
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from '../ui/dialog';
import { Form, FormField, FormLabel, FormItem, FormControl } from '../ui/form';
import { Input } from '../ui/input';
import { FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { connectYocoAction } from '~/app/actions/connect-yoco';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

function ConnectYocoDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<{ yocoApiKey: string }>({
    defaultValues: {
      yocoApiKey: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('yocoApiKey', data.yocoApiKey);

      const result = await connectYocoAction(formData);
      if (result?.success) {
        setIsOpen(false);
        toast.success('Yoco account connected successfully');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting Yoco account');
    } finally {
      setIsLoading(false);
      form.reset();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">
            Connect Yoco account
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="yocoApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yoco API Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your Yoco API key"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : 'Connect'}
              Connect
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectYocoDialog;
