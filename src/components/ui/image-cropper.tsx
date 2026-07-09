"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
}

export function ImageCropper({ open, onOpenChange, imageFile, onCropComplete, aspectRatio = 1 }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  React.useEffect(() => {
    if (imageFile) {
      setCrop(undefined);
      setCompletedCrop(null);
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""));
      reader.readAsDataURL(imageFile);
    } else {
      setImgSrc("");
    }
  }, [imageFile]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, aspectRatio, width, height),
        width,
        height
      );
      setCrop(crop);
    }
  }

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current || !imageFile) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], imageFile.name, {
        type: imageFile.type,
        lastModified: Date.now(),
      });
      onCropComplete(croppedFile);
      onOpenChange(false);
    }, imageFile.type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>Adjust the crop area for your image.</DialogDescription>
        </DialogHeader>
        
        {imgSrc && (
          <div className="flex justify-center max-h-[60vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: "60vh", objectFit: "contain" }}
              />
            </ReactCrop>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={generateCroppedImage} disabled={!completedCrop}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
