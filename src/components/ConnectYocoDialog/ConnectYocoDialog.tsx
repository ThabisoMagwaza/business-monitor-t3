'use client';
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from '../ui/dialog';

function ConnectYocoDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Yoco account</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectYocoDialog;
