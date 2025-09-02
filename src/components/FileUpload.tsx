import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParsedItem {
  name: string;
  quantity?: number;
  category?: string;
  notes?: string;
}

interface FileUploadProps {
  onItemsParsed?: (items: ParsedItem[]) => void;
  className?: string;
}

const FileUpload = ({ onItemsParsed, className }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const supportedFormats = [
    '.txt', '.csv', '.json', '.xlsx', '.xls',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'
  ];

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'txt':
      case 'csv':
      case 'json':
        return <FileText className="h-5 w-5" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return <Image className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const parseTextContent = (content: string): ParsedItem[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const items: ParsedItem[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Try to parse different formats
        // Format 1: "Item Name"
        // Format 2: "Item Name - Quantity"
        // Format 3: "Item Name, Quantity, Category"
        // Format 4: "Item Name (Quantity)"
        
        let item: ParsedItem = { name: trimmedLine };
        
        // Check for quantity patterns
        const quantityMatch = trimmedLine.match(/(.+?)\s*[-–]\s*(\d+)/);
        if (quantityMatch) {
          item.name = quantityMatch[1].trim();
          item.quantity = parseInt(quantityMatch[2]);
        } else {
          const parenMatch = trimmedLine.match(/(.+?)\s*\((\d+)\)/);
          if (parenMatch) {
            item.name = parenMatch[1].trim();
            item.quantity = parseInt(parenMatch[2]);
          } else {
            // Check for CSV format
            const parts = trimmedLine.split(',').map(part => part.trim());
            if (parts.length >= 2) {
              item.name = parts[0];
              const quantity = parseInt(parts[1]);
              if (!isNaN(quantity)) {
                item.quantity = quantity;
              }
              if (parts[2]) {
                item.category = parts[2];
              }
            }
          }
        }
        
        items.push(item);
      }
    });

    return items;
  };

  const processImageFile = async (file: File): Promise<ParsedItem[]> => {
    // For now, we'll simulate OCR processing
    // In a real implementation, you would integrate with an OCR service
    // like Tesseract.js, Google Cloud Vision API, or similar
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate OCR results - in reality, this would be the actual OCR output
        const mockItems: ParsedItem[] = [
          { name: "Toor Dal", quantity: 1, category: "DALS" },
          { name: "Basmati Rice", quantity: 2, category: "RICE" },
          { name: "Garam Masala", quantity: 1, category: "MASALA" },
          { name: "Coconut Oil", quantity: 1, category: "OILS" }
        ];
        resolve(mockItems);
      }, 2000);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setUploadedFile(file);
    setParsedItems([]);

    try {
      const fileExtension = file.name.toLowerCase().split('.').pop();
      let items: ParsedItem[] = [];

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
        // Process image file
        items = await processImageFile(file);
      } else {
        // Process text-based files
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        
        items = parseTextContent(content);
      }

      setProgress(100);
      setParsedItems(items);
      
      if (onItemsParsed) {
        onItemsParsed(items);
      }

      toast({
        title: "File processed successfully!",
        description: `Found ${items.length} items in "${file.name}"`,
      });

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setParsedItems([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Shopping List
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload your shopping list in any format - text files, images, spreadsheets, or handwritten lists
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!uploadedFile ? (
            <div className="text-center">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload your shopping list</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your file here, or click to browse
                </p>
                <Button onClick={triggerFileUpload} className="bg-primary hover:bg-primary/90">
                  Choose File
                </Button>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Supported formats:</p>
                  <div className="flex flex-wrap gap-1 justify-center mt-1">
                    {supportedFormats.map(format => (
                      <Badge key={format} variant="secondary" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadedFile.name)}
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearUpload}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Processing Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing file...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Results */}
              {parsedItems.length > 0 && !isProcessing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Found Items ({parsedItems.length})</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                  </div>
                  
                  {showPreview && (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {parsedItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          {item.quantity && (
                            <Badge variant="secondary">
                              Qty: {item.quantity}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => onItemsParsed?.(parsedItems)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Use This List
                    </Button>
                    <Button variant="outline" onClick={triggerFileUpload}>
                      Upload Different File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats.join(',')}
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload; 