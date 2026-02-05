import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, FileImage, Eye, EyeOff } from "lucide-react";

interface HeroData {
    _id: string;
    heading: string;
    subHeading: string;
    description: string;
    ctaText: string;
    secondaryCtaText: string;
    image: string;
    isTherapistAvailable: boolean;
    trustedBy: string;
    certifiedTherapists: boolean;
    rating: string;
    features: string[];
}

interface HeroSectionProps {
    data: HeroData;
    onEdit: (section: string, item: HeroData) => void;
    loading?: boolean;
}

export default function HeroSection({ data, onEdit, loading = false }: HeroSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Hero Section</h2>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onEdit('hero', data)}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Edit3 className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Saving...' : 'Edit'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                        <div className="flex-1 space-y-4 sm:space-y-6">
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Main Heading:</span>
                                <p className="text-lg sm:text-xl font-bold mt-2">{data.heading}</p>
                            </div>
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Sub Heading:</span>
                                <p className="mt-2 text-muted-foreground">{data.subHeading}</p>
                            </div>
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Description:</span>
                                <p className="mt-2 text-muted-foreground">{data.description}</p>
                            </div>
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Primary CTA Button:</span>
                                <p className="mt-2 font-medium text-primary">{data.ctaText}</p>
                            </div>
                            {/* <div>
                                <span className="font-medium text-sm text-muted-foreground">Secondary CTA Button:</span>
                                <p className="mt-2 font-medium text-primary">{data.secondaryCtaText}</p>
                            </div> */}
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Therapist Availability:</span>
                                <p className="mt-2">{data.isTherapistAvailable ? 'Available Now' : 'Not Available'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Trusted By:</span>
                                <p className="mt-2">{data.trustedBy}</p>
                            </div>
                            <div className="space-y-3">
                                <span className="font-medium text-sm text-muted-foreground">Features:</span>
                                <ul className="list-disc list-inside space-y-1">
                                    {(data.features || []).map((feature, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground">{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <div className="aspect-video sm:aspect-[4/3] lg:aspect-video bg-muted rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden shadow-inner w-full">
                                {data.image ? (
                                    <img
                                        src={data.image}
                                        alt="Hero section"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <FileImage className="mx-auto h-12 w-12" />
                                        <p className="text-sm mt-3">No image uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}