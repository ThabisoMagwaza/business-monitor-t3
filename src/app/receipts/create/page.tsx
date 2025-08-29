'use client';

import * as React from 'react';
import { Camera } from 'lucide-react';
import ReceiptPreview from '~/components/ReceiptPreview';
import { saveReceipt } from '~/app/actions';
import Page from '~/components/Page/Page';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog';
import Link from 'next/link';

export default function CreateReceiptPage() {
  const id = React.useId();

  const [previewSrc, setPreviewSrc] = React.useState('');
  const [receipt, setReceipt] = React.useState<File | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);

  const [receiptId, setReceiptId] = React.useState<number | null>(null);
  const [receiptName, setReceiptName] = React.useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) {
      return;
    }

    const file = files[0]!;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const src = event.target?.result;

      if (!src) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      setPreviewSrc(src.toString());
      setReceipt(file);
    };

    reader.readAsDataURL(file);
  };

  const handleImageSubmit = async () => {
    if (!receipt) {
      return;
    }

    try {
      const { name, id } = await saveReceipt(receipt);
      setReceiptId(id);
      setReceiptName(name);
      setSaveDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast('Error saving receipt');
    }
  };

  return (
    <Page>
      <h1 className="text-2xl font-bold text-center mt-4">Create Receipt</h1>

      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="receipt-upload"
        />
        <label
          htmlFor="receipt-upload"
          className="cursor-pointer flex flex-col items-center space-y-3"
        >
          <div className="bg-primary/10 p-4 rounded-full">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Take Photo or Upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG up to 10MB
            </p>
          </div>
        </label>
      </div>

      <form action={handleImageSubmit}>
        <input
          id={`${id}-image`}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          name="receipt"
          className="hidden"
        />

        {receipt && previewSrc && <ReceiptPreview previewSrc={previewSrc} />}
      </form>
      <AlertDialog open={saveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Receipt Saved</AlertDialogTitle>
            <AlertDialogDescription>
              {receiptName} has been saved to your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Link href={`/`}>Dashboard</Link>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setSaveDialogOpen(false);
                setReceipt(null);
                setPreviewSrc('');
              }}
            >
              Upload Another
            </AlertDialogAction>
            <AlertDialogAction asChild>
              <Link href={`/receipts/${receiptId}/review`}>Review Receipt</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
