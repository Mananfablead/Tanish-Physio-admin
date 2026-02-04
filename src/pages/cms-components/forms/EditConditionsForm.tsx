import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import {
  DialogFooter,
} from "@/components/ui/dialog";

interface ConditionsSectionData {
  _id: string;
  title: string;
  description: string;
  conditions: {
    name: string;
    image: string | File;
  }[];
  image: string | File;
  isPublic: boolean;
}

interface EditConditionsFormProps {
  data: ConditionsSectionData;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EditConditionsForm({ data, onSave, onCancel }: EditConditionsFormProps) {
  const [formData, setFormData] = useState({
    ...data,
    conditions: data?.conditions?.map(condition => ({
      ...condition,
      image: condition.image || null
    })) || []
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConditionChange = (index: number, field: string, value: any) => {
    const newConditions = [...(formData.conditions || [])];
    const finalValue = field === 'image' && value === '' ? null : value;
    newConditions[index] = {
      ...newConditions[index],
      [field]: finalValue
    };
    setFormData(prev => ({
      ...prev,
      conditions: newConditions
    }));
  };

  const addCondition = () => {
    const newCondition = { name: '', image: null };
    setFormData(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition]
    }));
  };

  const removeCondition = (index: number) => {
    const newConditions = (formData.conditions || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      conditions: newConditions
    }));
  };

  const handleSubmit = () => {
    const cleanedData = {
      ...formData,
      conditions: formData.conditions?.map(condition => ({
        ...condition,
        ...(condition.image ? { image: condition.image } : {})
      })) || []
    };
    
    onSave(cleanedData);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>
      <div>
        <Label className="text-sm">Short Description</Label>
        <Textarea
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="text-sm"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm">Conditions Treated</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCondition} className="text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Add Condition
          </Button>
        </div>
        <div className="space-y-3">
          {(formData.conditions || []).map((condition, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Label className="text-sm">Condition Name</Label>
                <Input
                  value={condition.name}
                  onChange={(e) => handleConditionChange(index, 'name', e.target.value)}
                  placeholder="Condition name"
                  className="text-sm"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">Image</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleConditionChange(index, 'image', file);
                        }
                      }}
                      className="hidden"
                      id={`condition-image-upload-${index}`}
                    />
                    <label
                      htmlFor={`condition-image-upload-${index}`}
                      className="flex flex-col items-center justify-center w-full h-10 border border-input rounded-md cursor-pointer bg-background hover:bg-accent transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload Image</span>
                    </label>
                  </div>
                  {condition.image && (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0">
                        <img
                          src={typeof condition.image === 'string' ? condition.image : URL.createObjectURL(condition.image as File)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleConditionChange(index, 'image', '')}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeCondition(index)}
                  disabled={(formData.conditions || []).length <= 1}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={handleSubmit}>Save Changes</Button>
      </DialogFooter>
    </div>
  );
}