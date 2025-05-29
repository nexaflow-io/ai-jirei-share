'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X } from 'lucide-react';

type ImageUploaderProps = {
  maxFiles: number;
  onImagesChange: (files: File[]) => void;
  existingImages?: { id: string; url: string }[];
  onExistingImageRemove?: (id: string) => void;
};

export function ImageUploader({
  maxFiles,
  onImagesChange,
  existingImages = [],
  onExistingImageRemove,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // 最大ファイル数を超えないように制限
      const remainingSlots = maxFiles - existingImages.length;
      const newFiles = acceptedFiles.slice(0, remainingSlots);
      
      if (newFiles.length === 0) return;

      // プレビュー用のURLを生成
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...newFiles];
        // 最大ファイル数を超えないように制限
        const limitedFiles = updatedFiles.slice(0, remainingSlots);
        onImagesChange(limitedFiles);
        return limitedFiles;
      });
      
      setPreviews(prevPreviews => {
        const updatedPreviews = [...prevPreviews, ...newPreviews];
        return updatedPreviews.slice(0, remainingSlots);
      });
    },
    [maxFiles, existingImages.length, onImagesChange]
  );

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      onImagesChange(newFiles);
      return newFiles;
    });

    setPreviews(prevPreviews => {
      const newPreviews = [...prevPreviews];
      URL.revokeObjectURL(newPreviews[index]); // メモリリーク防止
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const removeExistingImage = (id: string) => {
    if (onExistingImageRemove) {
      onExistingImageRemove(id);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: files.length + existingImages.length >= maxFiles,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        } ${
          files.length + existingImages.length >= maxFiles
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>ここにファイルをドロップ...</p>
        ) : (
          <div>
            <p>
              ここにファイルをドラッグ＆ドロップするか、クリックして選択してください
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {files.length + existingImages.length}/{maxFiles} 枚の画像
            </p>
          </div>
        )}
      </div>

      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {existingImages.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square relative rounded-md overflow-hidden border">
                <Image
                  src={image.url}
                  alt={`既存の画像 ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              {onExistingImageRemove && (
                <button
                  type="button"
                  onClick={() => removeExistingImage(image.id)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          {previews.map((preview, index) => (
            <div key={preview} className="relative group">
              <div className="aspect-square relative rounded-md overflow-hidden border">
                <Image
                  src={preview}
                  alt={`プレビュー ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
