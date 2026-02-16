import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, Eye, FileImage } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AboutData {
  _id: string;
  title: string;
  description: string;
  aboutheadline: string;
  aboutheadlDescription: string;
  image: string | File;
  images: (string | File)[];
  isPublic: boolean;
}

interface AboutSectionProps {
  data: AboutData;
  onEdit: (section: string, item: any) => void;
  loading?: boolean;
}

// No helper functions needed for simplified model

// Helper function to get image source (handles both File objects and URLs)
const getImageSrc = (image: string | File) => {
  if (typeof image === 'string') {
    return image;
  } else if (image instanceof File) {
    return URL.createObjectURL(image);
  }
  return '';
};

export default function AboutSection({ data, onEdit, loading = false }: AboutSectionProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">About Us Section</h2>
        <div className="flex gap-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>About Us Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{data.title}</h3>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Description:</h4>
                  <p className="text-gray-600">{data.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">About Headline:</h4>
                  <p className="text-gray-600">{data.aboutheadline}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">About Headline Description:</h4>
                  <p className="text-gray-600">{data.aboutheadlDescription}</p>
                </div>
                {data.image && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Main Image:</h4>
                    <img 
                      src={getImageSrc(data.image)} 
                      alt="Main Image" 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                {data.images && data.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Images ({data.images.length}):</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {data.images.slice(0, 4).map((img, index) => (
                        <img 
                          key={index}
                          src={getImageSrc(img)} 
                          alt={`Additional Image ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      ))}
                      {data.images.length > 4 && (
                        <div className="flex items-center justify-center bg-muted rounded-lg border">
                          <span className="text-muted-foreground">+{data.images.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit('about', data)}
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Edit3 className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Saving...' : 'Edit About Us'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Title: {data.title}</h3>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Description:</h4>
              <p className="text-gray-600 line-clamp-3">{data.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">About Headline:</h4>
              <p className="text-gray-600 line-clamp-2">{data.aboutheadline}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Main Image:</h4>
              <p className="text-gray-600">{data.image ? "Uploaded" : "Not uploaded"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Additional Images:</h4>
              <p className="text-gray-600">{data.images?.length || 0} images uploaded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.image && (
        <Card>
          <CardHeader>
            <CardTitle>Main Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg border overflow-hidden">
              <img
                src={getImageSrc(data.image)}
                alt="Main Image"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}
      {data.images && data.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {data.images.map((img, index) => (
                <div key={index} className="aspect-square bg-muted rounded-lg border overflow-hidden">
                  <img
                    src={getImageSrc(img)}
                    alt={`Additional Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}