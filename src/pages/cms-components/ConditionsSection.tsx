import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye } from "lucide-react";

interface ConditionsData {
    _id: string;
    title: string;
    description: string;
    conditions: Array<{
        name: string;
        image: string;
    }>;
}

interface ConditionsSectionProps {
    data: ConditionsData;
    onEdit: (section: string, item: ConditionsData) => void;
}

export default function ConditionsSection({ data, onEdit }: ConditionsSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Conditions We Treat</h2>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button size="sm" variant="outline" onClick={() => onEdit('conditions', data)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
                        <Badge variant="secondary" className="mb-4 border border-primary/20 w-fit">Specialties</Badge>
                        <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{data.title}</h3>
                        <p className="text-muted-foreground text-base sm:text-lg">
                            {data.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {(data.conditions || []).map((condition, index) => (
                            <div 
                                key={index}
                                className="group cursor-pointer py-3 sm:py-4 bg-gradient-to-br from-white to-muted/20 dark:from-background dark:to-muted/5 rounded-2xl p-4 sm:p-6 text-center shadow-soft border-2 border-transparent transition-all duration-500 border-primary/20 hover:shadow-xl hover:border-primary/30"
                            >
                                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                                    {condition.image ? (
                                        <img 
                                            src={condition.image} 
                                            alt={condition.name}
                                            className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                                        />
                                    ) : (
                                        <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center text-xs">No Image</div>
                                    )}
                                </div>
                                <span className="font-bold text-sm sm:text-base tracking-wide">{condition.name}</span>
                                <div className="mt-4 h-1 w-0 bg-primary mx-auto rounded-full group-hover:w-12 transition-all duration-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}