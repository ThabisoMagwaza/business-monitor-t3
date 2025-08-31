'use client';
import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';
import { Loader } from 'lucide-react';

function SubmitButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="default" disabled={pending}>
      {pending ? <Loader className="animate-spin" /> : icon}
      <span>{children}</span>
    </Button>
  );
}

export default SubmitButton;
