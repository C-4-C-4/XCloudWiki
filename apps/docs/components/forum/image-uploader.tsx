'use client';

/**
 * 图片上传组件
 * 支持拖拽和点击上传，最多 10 张
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { apiUploadImage } from './api';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList) => {
      const remaining = maxImages - images.length;
      if (remaining <= 0) return;

      const filesToUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      const newImages: string[] = [];

      for (const file of filesToUpload) {
        const { data, error } = await apiUploadImage(file);
        if (data && !error) {
          newImages.push(data.url);
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }

      setUploading(false);
    },
    [images, onChange, maxImages],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload],
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange],
  );

  return (
    <div className="space-y-3">
      {/* 已上传的图片预览 */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3 max-sm:grid-cols-3">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-fd-secondary border border-fd-border">
              <Image src={url} alt="" fill className="object-cover" sizes="120px" unoptimized />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? 'border-orange-500 bg-orange-500/5'
              : 'border-fd-border hover:border-orange-500/40 hover:bg-fd-accent/50'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 text-orange-500 animate-spin" />
              <span className="text-sm text-fd-muted-foreground">上传中...</span>
            </>
          ) : (
            <>
              <Upload className="size-6 text-fd-muted-foreground" />
              <span className="text-sm text-fd-muted-foreground">
                拖拽图片到这里或点击上传
              </span>
              <span className="text-xs text-fd-muted-foreground">
                支持 JPG, PNG, GIF, WebP · 最大 5MB · 还可上传 {maxImages - images.length} 张
              </span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleUpload(e.target.files);
                e.target.value = '';
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
