import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Edit, Eye } from "lucide-react";

interface StatData {
    label: string;
    value: string;
    description: string;
}

interface WhyUsData {
    id: number;
    title: string;
    description: string;
    stats: StatData[];
    features: string[];
}

interface WhyUsSectionProps {
    data: WhyUsData;
    onEdit: (section: string, item: WhyUsData) => void;
}

export default function WhyUsSection({ data, onEdit }: WhyUsSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Why Choose Us</h2>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button size="sm" variant="outline" onClick={() => onEdit('whyUs', data)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold">{data.title}</h3>
                        <p className="text-muted-foreground mt-3 text-base sm:text-lg">{data.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {data.stats.map((stat, index) => (
                            <div key={index} className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-4 sm:p-6 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full gradient-primary flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                                        <p className="text-sm sm:text-base font-semibold text-slate-900 mt-1">{stat.label}</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        {data.features.map((feature, index) => (
                            <div 
                                key={index}
                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-white/80 to-muted/50 border border-border shadow-sm backdrop-blur-sm hover:shadow-md transition-all"
                            >
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                                </div>
                                <span className="text-sm sm:text-base font-medium text-slate-800">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}