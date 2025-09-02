import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Image as ImageIcon, 
  X,
  Eye,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImagesUploaded?: (imageUrls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
  className?: string;
}

const ImageUpload = ({ 
  onImagesUploaded, 
  maxImages = 5, 
  existingImages = [],
  className 
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const [previewMode, setPreviewMode] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (uploadedImages.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed. You can upload ${maxImages - uploadedImages.length} more.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const newImages = [...uploadedImages, ...data.images];
      setUploadedImages(newImages);

      if (onImagesUploaded) {
        onImagesUploaded(newImages);
      }

      toast({
        title: "Images uploaded successfully!",
        description: `Uploaded ${files.length} image(s)`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(newImages);
    
    if (onImagesUploaded) {
      onImagesUploaded(newImages);
    }

    toast({
      title: "Image removed",
      description: "Image has been removed from the list",
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearAllImages = () => {
    setUploadedImages([]);
    if (onImagesUploaded) {
      onImagesUploaded([]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <Card className="w-full">
        <CardContent className="p-4 space-y-4">
          {/* Upload Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Product Images</h3>
              <Badge variant="secondary" className="text-xs">
                {uploadedImages.length}/{maxImages}
              </Badge>
            </div>
            
            {uploadedImages.length < maxImages && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload product images (JPEG, PNG, WebP)
                  </p>
                  <Button 
                    onClick={triggerFileUpload} 
                    size="sm"
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Choose Images
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading images...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                  Uploaded Images ({uploadedImages.length})
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewMode ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllImages}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>

              {previewMode && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={imageUrl.startsWith('/') ? `http://localhost:3001${imageUrl}` : imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!previewMode && (
                <div className="space-y-2">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Image {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(index)}
                        className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUpload;
