import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useModal } from '../../../context/ModalContext';

interface AttachmentUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxSize?: number;
  maxFiles?: number;
}

const allowedExtensions = ['.log', '.txt', '.sql', '.png', '.jpg', '.jpeg', '.pdf', '.zip'];

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  files,
  onChange,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 20,
}) => {
  const { showModal } = useModal();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return allowedExtensions.includes(extension) && file.size <= maxSize;
      });

      if (files.length + validFiles.length > maxFiles) {
        showModal({
          title: 'Límite de Archivos',
          message: `Se permite un máximo de ${maxFiles} archivos`,
          type: 'warning'
        });
        return;
      }

      onChange([...files, ...validFiles]);
    },
    [files, onChange, maxSize, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.log'],
      'application/sql': ['.sql'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
    },
    maxSize,
    multiple: true,
  });

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  const getFileIcon = (file: File) => {
    if (isImage(file)) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 mb-1">
          {isDragActive ? (
            <span className="font-medium text-indigo-600">Drop files here...</span>
          ) : (
            <>
              <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
            </>
          )}
        </p>
        <p className="text-xs text-gray-500">
          .log, .txt, .sql, .png, .jpg, .jpeg, .pdf, .zip (max {formatFileSize(maxSize)})
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {files.length} / {maxFiles} files uploaded
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attached Files</h4>
          <div className="grid grid-cols-1 gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* Icon or Preview */}
                <div className="flex-shrink-0">
                  {isImage(file) ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    </div>
                  ) : (
                    getFileIcon(file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Remove file"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Info */}
      {files.length >= maxFiles && (
        <p className="text-sm text-orange-600">
          Maximum number of files ({maxFiles}) reached
        </p>
      )}
    </div>
  );
};
