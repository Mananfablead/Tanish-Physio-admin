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
  mission: string;
  vision: string;
  values: string[];
  foundingStory: string;
  teamInfo: string;
  image: string | File;
  images: (string | File)[];
  isPublic: boolean;
}

interface AboutSectionProps {
  data: AboutData;
  onEdit: (section: string, item: any) => void;
  loading?: boolean;
}

// Helper function to get correct values array
const getCorrectValues = (data: AboutData) => {
  if (data.values && Array.isArray(data.values)) {
    // If it's already an array of strings
    let cmsValues = [...data.values];
    
    // Check if the first element is a JSON string (incorrectly stored)
    if (cmsValues.length === 1 && typeof cmsValues[0] === 'string') {
      try {
        const parsedValue = JSON.parse(cmsValues[0]);
        if (Array.isArray(parsedValue)) {
          cmsValues = parsedValue;
        }
      } catch {
        // If parsing fails, return empty array
        return [];
      }
    }
    return cmsValues;
  }
  return [];
};

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
                  <h4 className="text-sm font-medium text-gray-700">Mission:</h4>
                  <p className="text-gray-600">{data.mission}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Vision:</h4>
                  <p className="text-gray-600">{data.vision}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Core Values:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {getCorrectValues(data)?.map((value, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
                {data.image && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Image:</h4>
                    <img 
                      src={getImageSrc(data.image)} 
                      alt="About Us" 
                      className="w-full h-auto rounded-lg"
                    />
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
              <h4 className="text-sm font-medium text-gray-700">Mission:</h4>
              <p className="text-gray-600 line-clamp-2">{data.mission}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Vision:</h4>
              <p className="text-gray-600 line-clamp-2">{data.vision}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Founding Story:</h4>
              <p className="text-gray-600 line-clamp-2">{data.foundingStory}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Team Info:</h4>
              <p className="text-gray-600 line-clamp-2">{data.teamInfo}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Core Values:</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {getCorrectValues(data)?.slice(0, 3).map((value, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {value}
                  </span>
                ))}
                {getCorrectValues(data)?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{getCorrectValues(data).length - 3} more
                  </span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Images:</h4>
              <p className="text-gray-600">{data.images?.length || 0} images uploaded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.image && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg border overflow-hidden">
              <img
                src={getImageSrc(data.image)}
                alt="About Us"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}