'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { FileImage, Loader, Upload } from 'lucide-react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? <Loader className="animate-spin" /> : <Upload />}
      <span>Upload</span>
    </Button>
  );
}

function ReceiptPreview({
  previewSrc,
  fileName,
  canUpload = true,
}: {
  previewSrc: string;
  fileName?: string;
  canUpload?: boolean;
}) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileImage className="h-4 w-4" />
            <span>Preview</span>
          </CardTitle>

          {canUpload && <UploadButton />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-48 rounded-lg overflow-hidden bg-white">
          <Image
            priority
            src={previewSrc}
            alt="Receipt preview"
            className="w-full h-full object-contain"
            width={400}
            height={400}
          />
        </div>
        {fileName && (
          <p className="text-sm text-muted-foreground mt-2 truncate">
            {fileName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default ReceiptPreview;
