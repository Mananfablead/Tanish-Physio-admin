import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";
import {
  DialogFooter,
} from "@/components/ui/dialog";

interface ConditionData {
  name?: string;
  title?: string;
  image: string | File | null;
  content?: string;
}

interface BackendConditionData {
  title: string;
  content: string;
  image?: string | File | null;
}

interface EditConditionFormProps {
  data: ConditionData;
  onSave: (data: BackendConditionData) => void;
  onCancel: () => void;
}

export default function EditConditionForm({ data, onSave, onCancel }: EditConditionFormProps) {
  const [formData, setFormData] = useState<ConditionData>({
    name: data?.name || data?.title || '',
    image: data?.image || null,
    content: data?.content || '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = () => {
    const cleanedData = {
      title: formData.name, // Map frontend 'name' to backend 'title'
      content: formData.content || '',
      ...(formData.image ? { image: formData.image } : {})
    };
    
    onSave(cleanedData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Condition Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter condition name"
        />
      </div>
      
      <div>
        <Label>Content</Label>
        <Input
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Enter condition content/description"
        />
      </div>
      
      <div>
        <Label>Condition Image</Label>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageChange(file);
                }
              }}
              className="hidden"
              id="condition-image-upload"
            />
            <label
              htmlFor="condition-image-upload"
              className="flex flex-col items-center justify-center w-full h-12 border border-input rounded-md cursor-pointer bg-background hover:bg-accent transition-colors"
            >
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">
                {formData.image ? 'Change Image' : 'Upload Image'}
              </span>
            </label>
          </div>
          
          {formData.image && (
            <div className="flex-1 flex items-center gap-3">
              <div className="w-16 h-16 rounded border overflow-hidden flex-shrink-0">
                <img
                  src={
                    typeof formData.image === 'string' 
                      ? formData.image 
                      : URL.createObjectURL(formData.image as File)
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleImageChange(null)}
                className="h-9 w-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={handleSubmit}>Save Condition</Button>
      </DialogFooter>
    </div>
  );
}