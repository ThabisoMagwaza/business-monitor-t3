'use client';
import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';
import { Loader, Upload } from 'lucide-react';

function SubmitButton({
  children,
  loadingText,
}: {
  children: React.ReactNode;
  loadingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="default" disabled={pending}>
      {pending ? <Loader className="animate-spin" /> : <Upload />}
      <span>{children}</span>
    </Button>
  );
}

export default SubmitButton;
