
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  description?: string;
}

interface DocumentViewerProps {
  documents: Document[];
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewer, setShowViewer] = useState(true);

  // Filter documents to only show PDFs and images
  const viewableDocuments = documents.filter(doc => 
    doc.file_type === 'application/pdf' || 
    doc.file_type.startsWith('image/')
  );

  if (viewableDocuments.length === 0) {
    return null;
  }

  const currentDocument = viewableDocuments[currentIndex];

  const nextDocument = () => {
    setCurrentIndex((prev) => (prev + 1) % viewableDocuments.length);
  };

  const prevDocument = () => {
    setCurrentIndex((prev) => (prev - 1 + viewableDocuments.length) % viewableDocuments.length);
  };

  const renderDocument = () => {
    if (!currentDocument) return null;

    if (currentDocument.file_type === 'application/pdf') {
      return (
        <iframe
          src={currentDocument.file_path}
          className="w-full h-96 border rounded-md"
          title={currentDocument.file_name}
        />
      );
    }

    if (currentDocument.file_type.startsWith('image/')) {
      return (
        <img
          src={currentDocument.file_path}
          alt={currentDocument.file_name}
          className="w-full h-96 object-contain border rounded-md bg-gray-50"
        />
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Document Viewer
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewer(!showViewer)}
              >
                {showViewer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardTitle>
            <CardDescription>
              {currentDocument.file_name} ({currentIndex + 1} of {viewableDocuments.length})
            </CardDescription>
          </div>
          {viewableDocuments.length > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevDocument}
                disabled={viewableDocuments.length <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextDocument}
                disabled={viewableDocuments.length <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {showViewer && (
        <CardContent>
          {renderDocument()}
        </CardContent>
      )}
    </Card>
  );
};
