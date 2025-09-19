
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { uploadStockFromExcel } from '@/services/stockUploadService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StockUploadDialogProps {
  onUploadSuccess: () => void;
}

export function StockUploadDialog({ onUploadSuccess }: StockUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadStockFromExcel(file);

      if (result.success) {
        toast({
          title: "Upload successful",
          description: result.message,
        });
        onUploadSuccess();
        setOpen(false);
        setFile(null);
      } else {
        toast({
          title: "Upload failed",
          description: result.message,
          variant: "destructive",
        });
        
        if (result.errorItems && result.errorItems.length > 0) {
          setErrors(result.errorItems);
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Stock Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Upload an Excel file with stock data. The file should have columns:
              No., Description, Search Description, Type, and Inventory.
            </p>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="stock-file" className="text-sm font-medium">
                Select Excel File
              </label>
              <input
                id="stock-file"
                type="file"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                disabled={isUploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {file.name}
                </p>
              )}
            </div>
            
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Invalid Item Codes</AlertTitle>
                <AlertDescription>
                  <p>The following item codes do not exist in the system:</p>
                  <div className="max-h-40 overflow-y-auto mt-2">
                    <ul className="list-disc pl-5 text-sm">
                      {errors.map((itemCode, index) => (
                        <li key={index}>{itemCode}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
