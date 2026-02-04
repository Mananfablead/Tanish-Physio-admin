import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import {
  DialogFooter,
} from "@/components/ui/dialog";

interface HeroData {
  _id: string;
  heading: string;
  subHeading: string;
  description: string;
  ctaText: string;
  secondaryCtaText: string;
  image: string | File;
  isTherapistAvailable: boolean;
  trustedBy: string;
  certifiedTherapists: boolean;
  rating: string;
  features: string[];
  isPublic: boolean;
}

interface EditHeroFormProps {
  data: HeroData;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EditHeroForm({ data, onSave, onCancel }: EditHeroFormProps) {
  const [formData, setFormData] = useState(data);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), '']
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = (formData.features || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm">Main Heading</Label>
        <Input
          value={formData.heading}
          onChange={(e) => handleChange('heading', e.target.value)}
          className="text-sm"
        />
      </div>
      <div>
        <Label className="text-sm">Sub Heading</Label>
        <Input
          value={formData.subHeading}
          onChange={(e) => handleChange('subHeading', e.target.value)}
          className="text-sm"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
      <div>
        <Label className="text-sm">Primary CTA Button Text</Label>
        <Input
          value={formData.ctaText}
          onChange={(e) => handleChange('ctaText', e.target.value)}
          className="text-sm"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="therapist-available"
          checked={formData.isTherapistAvailable}
          onChange={(e) => handleChange('isTherapistAvailable', e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="therapist-available" className="text-sm">Show Therapist Available Indicator</Label>
      </div>
      <div>
        <Label className="text-sm">Trusted By Text</Label>
        <Input
          value={formData.trustedBy}
          onChange={(e) => handleChange('trustedBy', e.target.value)}
          className="text-sm"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Features</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFeature}>
            <Plus className="h-4 w-4 mr-2" /> Add Feature
          </Button>
        </div>
        <div className="space-y-2">
          {(formData.features || []).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => removeFeature(index)}
                disabled={(formData.features || []).length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm">Hero Image</Label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="hero-image-upload"
            />
            <label
              htmlFor="hero-image-upload"
              className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors"
            >
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm text-muted-foreground">Click to upload image</span>
            </label>
          </div>
          {formData.image && (
            <div className="flex-1">
              <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                <img
                  src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image as File)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={handleSubmit}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}