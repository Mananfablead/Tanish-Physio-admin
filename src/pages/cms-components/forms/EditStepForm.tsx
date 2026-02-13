import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { ValidationError, validateForm, stepValidationSchema } from "@/lib/validation";

interface StepData {
  _id: string;
  title: string;
  description: string;
  icon: string;
  image: string | File;
  isPublic: boolean;
}

interface EditStepFormProps {
  data: StepData | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  isNew: boolean;
}

export default function EditStepForm({ data, onSave, onCancel, isNew }: EditStepFormProps) {
  const [formData, setFormData] = useState(data || { 
    _id: '', 
    title: '', 
    description: '', 
    icon: '', 
    image: '',
    isPublic: true 
  });
  const [errors, setErrors] = useState<ValidationError>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const validate = () => {
    const validationErrors = validateForm(formData, stepValidationSchema);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (newItem = false) => {
    if (validate()) {
      onSave({ ...formData, isNew: newItem });
    } else {
      // Mark all fields as touched to show errors
      setTouchedFields({
        title: true,
        description: true,
        image: true
      });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <Label className="text-sm">Step Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={`text-sm ${errors.title && touchedFields.title ? 'border-red-500' : ''}`}
        />
        {errors.title && touchedFields.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>
      <div>
        <Label className="text-sm">Step Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={`text-sm ${errors.description && touchedFields.description ? 'border-red-500' : ''}`}
        />
        {errors.description && touchedFields.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>
     <div>
  <Label className="text-sm">Step Image</Label>

  <div className="flex gap-4 mt-2">
    {/* Upload box */}
    <div className="w-32 h-32 sm:w-36 sm:h-36">
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id={`step-${formData._id || "new"}-image-upload`}
      />
      <label
        htmlFor={`step-${formData._id || "new"}-image-upload`}
        className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors ${errors.image && touchedFields.image ? 'border-red-500' : ''}`}
      >
        <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground mb-1" />
        <span className="text-xs text-muted-foreground text-center">
          Upload Image
        </span>
      </label>
    </div>

    {/* Preview box */}
    {formData.image && (
      <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-lg border overflow-hidden bg-muted">
        <img
          src={
            typeof formData.image === "string"
              ? formData.image
              : URL.createObjectURL(formData.image as File)
          }
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
    )}
  </div>
  {errors.image && touchedFields.image && (
    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
  )}
</div>
    
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel} className="text-sm">Cancel</Button>
        <Button type="button" onClick={() => handleSubmit(isNew)} className="text-sm">
          {isNew ? 'Add Step' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </div>
  );
}