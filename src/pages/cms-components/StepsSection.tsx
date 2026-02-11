import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, PlusCircle, Trash2, FileImage, Eye } from "lucide-react";

interface StepData {
    _id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
    heading?: string;
    subHeading?: string;
}

interface StepsSectionProps {
    data: StepData[];
    onAdd: () => void;
    onDelete: (_id: string) => void;
    onEdit: (item: StepData) => void;
    loading?: {
        create?: boolean;
        update?: boolean;
        delete?: boolean;
    };
}

export default function StepsSection({ data, onAdd, onDelete, onEdit, loading }: StepsSectionProps) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How It Works Steps</h2>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={onAdd}
                            disabled={loading?.create}
                        >
                            {loading?.create ? (
                                <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <PlusCircle className="w-4 h-4 mr-2" />
                            )}
                            {loading?.create ? 'Adding...' : 'Add Multiple Steps'}
                        </Button>
                    </div>
                </div>
                
                {/* Display common fields if available from the first step */}
                {data && data.length > 0 && (data[0].heading || data[0].subHeading) && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Common Fields for All Steps:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data[0].heading && (
                                <div>
                                    <span className="text-sm text-muted-foreground">Main Heading:</span>
                                    <p className="font-medium text-gray-800">{data[0].heading}</p>
                                </div>
                            )}
                            {data[0].subHeading && (
                                <div>
                                    <span className="text-sm text-muted-foreground">Sub Heading:</span>
                                    <p className="font-medium text-gray-800">{data[0].subHeading}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <div className="overflow-x-auto rounded-xl border">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr className="text-sm sm:text-base">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Image</th>
                                {/* <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Image</th> */}
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {(data || []).map((step, index) => (
                                <tr key={step._id} className="hover:bg-muted/50 transition-colors text-sm">
                                    <td className="px-4 py-3 font-mono text-xs sm:text-sm">{index + 1}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <div className="font-medium text-sm">{step.title}</div>
                                    </td>
                                    <td className="px-4 py-3 sm:hidden">
                                        <div>
                                            <div className="font-medium text-sm">{step.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{step.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <div className="text-xs sm:text-sm text-muted-foreground max-w-xs">{step.description}</div>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {step.image ? (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted">
                                                <img
                                                    src={step.image}
                                                    alt="Step preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.innerHTML = '<div class="text-xs text-muted-foreground p-2">Invalid image</div>';
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">
                                                No image
                                            </Badge>
                                        )}
                                    </td>
                                    {/* <td className="px-4 py-3 hidden xl:table-cell">
                                        {step.image ? (
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border">
                                                <img
                                                    src={step.image}
                                                    alt="Step"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No image</span>
                                        )}
                                    </td> */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => onEdit(step)} 
                                                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                                                disabled={loading?.update}
                                            >
                                                {loading?.update ? (
                                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Edit className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(step._id)}
                                                disabled={data.length <= 1 || loading?.delete}
                                                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                                            >
                                                {loading?.delete ? (
                                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}