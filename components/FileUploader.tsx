import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, selectedFile, onClear, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    if (!selectedFile && !disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile && previewUrl) {
    return (
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-100 group">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-full object-contain bg-slate-100" 
        />
        {!disabled && (
          <div className="absolute top-2 right-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-2 bg-white/90 text-red-500 rounded-full shadow hover:bg-red-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full h-64 md:h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      <div className="bg-indigo-100 p-4 rounded-full mb-4 text-indigo-600">
        <Upload size={32} />
      </div>
      <p className="text-lg font-medium text-slate-700">Kéo thả hình ảnh hoặc nhấn để tải lên</p>
      <p className="text-sm text-slate-500 mt-2">Hỗ trợ JPG, PNG, WEBP</p>
    </div>
  );
};

export default FileUploader;