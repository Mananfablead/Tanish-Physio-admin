import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { ValidationError, validateForm, conditionValidationSchema } from "@/lib/validation";

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
    name: '',
    image: null,
    content: '',
  });
  const [errors, setErrors] = useState<ValidationError>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
  // Initialize form data when data prop changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData({
        name: data?.name || data?.title || '',
        image: data?.image || null,
        content: data?.content || '',
      });
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }

    // Mark field as touched
    if (!touchedFields[field]) {
      setTouchedFields(prev => ({
        ...prev,
        [field]: true
      }));
    }
  };

  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file
    }));

    // Clear error for image field
    if (errors.image) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.image;
        return newErrors;
      });
    }

    // Mark image field as touched
    if (!touchedFields.image) {
      setTouchedFields(prev => ({
        ...prev,
        image: true
      }));
    }
  };

  const validate = () => {
    const validationErrors = validateForm(formData, conditionValidationSchema);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const cleanedData = {
        title: formData.name, // Map frontend 'name' to backend 'title'
        content: formData.content || '',
        ...(formData.image ? { image: formData.image } : {})
      };
      
      onSave(cleanedData);
    } else {
      // Mark all fields as touched to show errors
      setTouchedFields({
        name: true,
        content: true,
        image: true
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Condition Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter condition name"
          className={errors.name && touchedFields.name ? 'border-red-500' : ''}
        />
        {errors.name && touchedFields.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>
      
      <div>
        <Label>Content</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Enter condition content/description"
          rows={4}
          className={errors.content && touchedFields.content ? 'border-red-500' : ''}
        />
        {errors.content && touchedFields.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content}</p>
        )}
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
              className={`flex flex-col items-center justify-center w-full h-12 border border-input rounded-md cursor-pointer bg-background hover:bg-accent transition-colors ${errors.image && touchedFields.image ? 'border-red-500' : ''}`}
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
        {errors.image && touchedFields.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}
      </div>
      
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={handleSubmit}>Save Condition</Button>
      </DialogFooter>
    </div>
  );
}