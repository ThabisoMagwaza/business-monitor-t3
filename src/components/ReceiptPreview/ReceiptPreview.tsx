'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Loader, Upload, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

function UploadButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="default" disabled={pending}>
      {pending ? <Loader className="animate-spin" /> : <Upload />}
      <span>{children}</span>
    </Button>
  );
}

function ReceiptPreview({
  previewSrc,
  rescan = false,
}: {
  previewSrc: string;
  fileName?: string;
  rescan?: boolean;
}) {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(1, Math.min(5, scale * delta));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2) {
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        setDragStart({ x: distance, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1) {
      // Single touch drag
      const touch = e.touches[0];
      if (touch) {
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't prevent default to avoid passive event listener issues
    // The container's overflow hidden will prevent unwanted scrolling

    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2) {
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const delta = distance / dragStart.x;
        const newScale = Math.max(1, Math.min(5, scale * delta));
        setScale(newScale);
        setDragStart({ x: distance, y: 0 });
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Single touch drag
      const touch = e.touches[0];
      if (touch) {
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setScale(Math.min(5, scale + 0.5));
  };

  const zoomOut = () => {
    setScale(Math.max(1, scale - 0.5));
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 1}
                className="h-8 w-8 p-0"
                type="button"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 5}
                className="h-8 w-8 p-0"
                type="button"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                disabled={scale === 1 && position.x === 0 && position.y === 0}
                className="h-8 w-8 p-0"
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>

          <UploadButton>{rescan ? 'Rescan' : 'Upload'}</UploadButton>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Zoom Container */}
          <div
            ref={containerRef}
            className="relative w-full h-48 rounded-lg overflow-hidden bg-white cursor-move"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: scale > 1 ? 'grab' : 'default' }}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                transform: `scale(${scale}) translate(${
                  position.x / scale
                }px, ${position.y / scale}px)`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              <Image
                ref={imageRef}
                priority
                src={previewSrc}
                alt="Receipt preview"
                className="max-w-full max-h-full object-contain"
                width={400}
                height={400}
                draggable={false}
              />
            </div>

            {/* Zoom indicator overlay */}
            {scale > 1 && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Zoom: {Math.round(scale * 100)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReceiptPreview;
