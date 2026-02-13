import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Upload } from "lucide-react";

/* ---------------- TYPES ---------------- */

interface StepData {
  _id?: string;
  title: string;
  description: string;
  icon?: string;
  image?: string | File;
  heading?: string;
  subHeading?: string;
}

interface CommonStepData {
  heading: string;
  subHeading: string;
}

interface MultiStepFormProps {
  data?: CommonStepData; // ✅ ONLY section-level data
  onSave: (steps: StepData[]) => void;
  onCancel: () => void;
}

interface FormErrors {
  heading?: string;
  subHeading?: string;
  steps?: {
    [index: number]: {
      title?: string;
      description?: string;
      image?: string; // ✅ ADD THIS
    };
  };
}


/* ---------------- COMPONENT ---------------- */

export default function MultiStepForm({
  data,
  onSave,
  onCancel
}: MultiStepFormProps) {
  /* -------- Common fields (SECTION LEVEL) -------- */
  const [commonFields, setCommonFields] = useState<CommonStepData>({
    heading: data?.heading || "",
    subHeading: data?.subHeading || ""
  });

  /* -------- Steps -------- */
  const [steps, setSteps] = useState<StepData[]>([
    {
      title: "",
      description: "",
      image: ""
    }
  ]);

  const [errors, setErrors] = useState<FormErrors>({});

  /* ---------------- HANDLERS ---------------- */

  const updateCommonField = (
    field: keyof CommonStepData,
    value: string
  ) => {
    setCommonFields(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateStep = (
    index: number,
    field: keyof StepData,
    value: any
  ) => {
    setSteps(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    if (errors.steps?.[index]?.[field as "title" | "description" | "image"]) {
      setErrors(prev => ({
        ...prev,
        steps: {
          ...prev.steps,
          [index]: {
            ...prev.steps?.[index],
            [field]: undefined
          }
        }
      }));
    }
  };

  const addStep = () => {
    setSteps(prev => [
      ...prev,
      { title: "", description: "", image: "" }
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleImageUpload = (
  index: number,
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (file) {
    updateStep(index, "image", file);

    // ✅ clear image error
    if (errors.steps?.[index]?.image) {
      setErrors(prev => ({
        ...prev,
        steps: {
          ...prev.steps,
          [index]: {
            ...prev.steps?.[index],
            image: undefined
          }
        }
      }));
    }
  }
};

  // Function to get image preview URL
  const getImagePreviewUrl = (image: string | File) => {
    if (typeof image === 'string') {
      return image;
    } else if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return '';
  };


  /* ---------------- VALIDATION ---------------- */

const validateForm = () => {
  let valid = true;
  const newErrors: FormErrors = {};

  // 🔴 Heading
  if (!commonFields.heading.trim()) {
    newErrors.heading = "Main heading is required";
    valid = false;
  }

  // 🔴 Sub Heading
  if (!commonFields.subHeading.trim()) {
    newErrors.subHeading = "Sub heading is required";
    valid = false;
  }

  const stepErrors: FormErrors["steps"] = {};

  steps.forEach((step, index) => {
    // 🔴 Title
    if (!step.title.trim()) {
      stepErrors[index] = {
        ...stepErrors[index],
        title: "Step title is required"
      };
      valid = false;
    }

    // 🔴 Description
    if (!step.description.trim()) {
      stepErrors[index] = {
        ...stepErrors[index],
        description: "Step description is required"
      };
      valid = false;
    }

    // 🔴 Image
    if (!step.image) {
      stepErrors[index] = {
        ...stepErrors[index],
        image: "Step image is required"
      };
      valid = false;
    }
  });

  if (Object.keys(stepErrors).length > 0) {
    newErrors.steps = stepErrors;
  }

  setErrors(newErrors);
  return valid;
};


  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = () => {
    if (!validateForm()) return;

    const finalSteps = steps.map(step => ({
      ...step,
      heading: commonFields.heading,
      subHeading: commonFields.subHeading
    }));

    onSave(finalSteps);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold text-primary">
          Add Multiple Steps
        </h3>
        <p className="text-sm text-muted-foreground">
          Create multiple steps at once for the How It Works section
        </p>
      </div>

      {/* Common Fields */}
      <div className="border rounded-lg p-4 bg-secondary/20">
        <h4 className="font-medium text-sm mb-3 text-primary">
          Common Fields for All Steps
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Main Heading</Label>
            <Input
              value={commonFields.heading}
              onChange={e =>
                updateCommonField("heading", e.target.value)
              }
              className={errors.heading ? "border-red-500" : ""}
            />
           {errors.heading && (
  <p className="text-xs text-red-500 mt-1">{errors.heading}</p>
)}

          </div>

          <div>
            <Label>Sub Heading</Label>
            <Input
              value={commonFields.subHeading}
              onChange={e =>
                updateCommonField("subHeading", e.target.value)
              }
              className={errors.subHeading ? "border-red-500" : ""}
            />
            {errors.subHeading && (
              <p className="text-xs text-red-500 mt-1">
                {errors.subHeading}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Steps */}
      {steps.map((step, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Step {index + 1}</h4>
            {steps.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => removeStep(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div>
            <Label>Step Title</Label>
            <Input
              value={step.title}
              onChange={e =>
                updateStep(index, "title", e.target.value)
              }
              className={
                errors.steps?.[index]?.title
                  ? "border-red-500"
                  : ""
              }
            />
            {errors.steps?.[index]?.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.steps[index].title}
              </p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={step.description}
              onChange={e =>
                updateStep(index, "description", e.target.value)
              }
              className={
                errors.steps?.[index]?.description
                  ? "border-red-500"
                  : ""
              }
            />
            {errors.steps?.[index]?.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.steps[index].description}
              </p>
            )}
          </div>

          <div>
            <Label>Image</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={e => handleImageUpload(index, e)}
                className={
                  errors.steps?.[index]?.image
                    ? "border-red-500"
                    : ""
                }
              />
              {errors.steps?.[index]?.image && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.steps[index].image}
                </p>
              )}
              
              {/* Image Preview */}
              {steps[index].image && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border overflow-hidden flex items-center justify-center bg-muted">
                    <img
                      src={getImagePreviewUrl(steps[index].image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={addStep}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Step
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add {steps.length} Step{steps.length > 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      <Badge variant="secondary">
        {steps.length} step{steps.length > 1 ? "s" : ""} added
      </Badge>
    </div>
  );
}
