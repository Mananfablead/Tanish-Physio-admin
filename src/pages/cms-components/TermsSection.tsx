import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, FileText, Calendar, User, Eye } from "lucide-react";

interface TermsData {
    id: number;
    title: string;
    content: string;
    lastUpdated?: string;
    version?: string;
}

interface TermsSectionProps {
    data: TermsData;
    onEdit: (section: string, item: TermsData) => void;
}

export default function TermsSection({ data, onEdit }: TermsSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Terms & Pages</h2>
                            {data.version && (
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Version: {data.version}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button size="sm" variant="outline" onClick={() => onEdit('terms', data)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{data.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                            {data.lastUpdated && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Last updated: {data.lastUpdated}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none border rounded-xl p-4 sm:p-6 bg-muted/5 border-border">
                        <div className="whitespace-pre-line leading-relaxed text-sm sm:text-base text-foreground/90">
                            {data.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}