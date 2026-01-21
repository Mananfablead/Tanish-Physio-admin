import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Upload } from "lucide-react";

interface StepData {
    _id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
}

interface MultiStepFormProps {
    onSave: (steps: StepData[]) => void;
    onCancel: () => void;
}

export default function MultiStepForm({ onSave, onCancel }: MultiStepFormProps) {
    const [commonFields, setCommonFields] = useState({
        heading: '',
        subHeading: ''
    });
    
    const [steps, setSteps] = useState<StepData[]>([
        { _id: '', title: '', description: '', icon: '', image: '' }
    ]);

    const addStep = () => {
        setSteps(prev => [
            ...prev,
            { _id: '', title: '', description: '', icon: '', image: '' }
        ]);
    };

    const removeStep = (index: number) => {
        if (steps.length > 1) {
            setSteps(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateStep = (index: number, field: keyof StepData, value: string) => {
        setSteps(prev => {
            const newSteps = [...prev];
            newSteps[index] = { ...newSteps[index], [field]: value };
            return newSteps;
        });
    };

    const updateCommonField = (field: 'heading' | 'subHeading', value: string) => {
        setCommonFields(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateStep(index, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        // Filter out steps with empty titles to prevent saving invalid steps
        const validSteps = steps.filter(step => step.title.trim() !== '');
        if (validSteps.length > 0) {
            // Merge common fields with each step before saving
            const stepsWithCommonFields = validSteps.map(step => ({
                ...step,
                heading: commonFields.heading,
                subHeading: commonFields.subHeading
            }));
            onSave(stepsWithCommonFields);
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b pb-3">
                <h3 className="text-lg font-semibold text-primary">Add Multiple Steps</h3>
                <p className="text-sm text-muted-foreground">Create multiple steps at once for the How It Works section</p>
            </div>
            
            {/* Common Fields Section */}
            <div className="border rounded-lg p-4 bg-secondary/20">
                <h4 className="font-medium text-sm mb-3 text-primary">Common Fields for All Steps</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm">Main Heading</Label>
                        <Input
                            value={commonFields.heading}
                            onChange={(e) => updateCommonField('heading', e.target.value)}
                            placeholder="Enter main heading"
                            className="text-sm"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-sm">Sub Heading</Label>
                        <Input
                            value={commonFields.subHeading}
                            onChange={(e) => updateCommonField('subHeading', e.target.value)}
                            placeholder="Enter sub heading"
                            className="text-sm"
                        />
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                {steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-card relative">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-sm">Step {index + 1}</h4>
                            {steps.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeStep(index)}
                                    disabled={steps.length <= 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Step Title *</Label>
                                <Input
                                    value={step.title}
                                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                                    placeholder="Enter step title"
                                    className="text-sm"
                                />
                            </div>
                            

                            
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm">Step Description</Label>
                                <Textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                                    placeholder="Enter step description"
                                    className="text-sm min-h-[80px]"
                                />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-sm">Step Image</Label>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(index, e)}
                                            className="hidden"
                                            id={`step-${index}-image-upload`}
                                        />
                                        <label
                                            htmlFor={`step-${index}-image-upload`}
                                            className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent transition-colors"
                                        >
                                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-1 sm:mb-2" />
                                            <span className="text-xs sm:text-sm text-muted-foreground">Click to upload image</span>
                                        </label>
                                    </div>
                                    {step.image && (
                                        <div className="flex-1">
                                            <div className="aspect-square bg-muted rounded-lg border flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={step.image}
                                                    alt="Step preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addStep}
                    className="flex items-center"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Another Step
                </Button>
                
                <div className="ml-auto flex gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit}>
                        Add {steps.length} Step{steps.length !== 1 ? 's' : ''}
                    </Button>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{steps.length} Step{steps.length !== 1 ? 's' : ''}</Badge>
                <span>added to form</span>
            </div>
        </div>
    );
}