import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileCode, FileText, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadWidgetProps {
  title: string;
  description: string;
  acceptedTypes: string;
  icon: 'code' | 'log';
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUploadWidget({
  title,
  description,
  acceptedTypes,
  icon,
  onFileSelect,
  selectedFile
}: FileUploadWidgetProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const IconComponent = icon === 'code' ? FileCode : FileText;

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
        isDragOver 
          ? "border-primary bg-primary/10" 
          : selectedFile 
            ? "border-success/50 bg-success/5" 
            : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        className="hidden"
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={cn(
          "p-3 rounded-xl transition-colors",
          selectedFile ? "bg-success/20" : "bg-muted"
        )}>
          {selectedFile ? (
            <Check className="w-6 h-6 text-success" />
          ) : (
            <IconComponent className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {selectedFile ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <IconComponent className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono truncate max-w-[150px]">
              {selectedFile.name}
            </span>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-destructive/20 rounded-md transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className="w-3 h-3" />
            <span>Drag & drop or click to browse</span>
          </div>
        )}
      </div>
    </div>
  );
}
