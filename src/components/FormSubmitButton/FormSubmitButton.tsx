'use client';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

function FormSubmitButton({
  children,
  loadingText,
}: {
  children: React.ReactNode;
  loadingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-4 flex-end flex flex-col gap-2">
      {pending && <span>{loadingText}</span>}
      <Button disabled={pending}>{children}</Button>
    </div>
  );
}

export default FormSubmitButton;
